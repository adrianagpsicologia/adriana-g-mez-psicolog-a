import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_PUBLISHABLE_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check admin role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!roleData) throw new Error("Not authorized");

    const { fullName, email } = await req.json();
    if (!fullName || !email) throw new Error("fullName and email are required");

    // Check if a user with this email already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      // User exists - just create a new profile entry for them
      userId = existingUser.id;
    } else {
      // Create new auth user with a random password (they'll use password reset to set their own)
      const randomPassword = crypto.randomUUID() + "Aa1!";
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Update the profile name (the trigger may have already created a profile)
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      await adminClient
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", userId);
    }

    return new Response(JSON.stringify({ userId, fullName, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating patient:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
