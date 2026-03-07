import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload: any = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: any) => {
    const json = new TextEncoder().encode(JSON.stringify(obj));
    return btoa(String.fromCharCode(...json)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const pemContent = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");

  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${unsignedToken}.${signatureB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

function parseServiceAccount(raw: string): any {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const cleaned = raw.trim().replace(/^[\"']|[\"']$/g, '');
    parsed = JSON.parse(cleaned);
  }
  return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, startTime, endTime, patientName, serviceName, attendeeEmail, userId } = await req.json();
    if (!date || !startTime || !endTime) {
      return new Response(JSON.stringify({ error: "date, startTime, and endTime are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let resolvedEmail = attendeeEmail || null;
    if (!resolvedEmail && userId) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        resolvedEmail = userData?.user?.email || null;
      } catch (e) {
        console.error("Could not resolve attendee email:", e);
      }
    }

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "c_bbf6aa6d0a95567141bd23cdb9b71dc9ed9aedd641e3951484768e9beb3689cd@group.calendar.google.com";

    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "Google Calendar not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccount = parseServiceAccount(serviceAccountJson);
    const accessToken = await getAccessToken(serviceAccount, calendarId);

    const startHHMM = startTime.substring(0, 5);
    const endHHMM = endTime.substring(0, 5);

    const event: any = {
      summary: `${serviceName || "Sesión"} - ${patientName || "Paciente"}`,
      start: {
        dateTime: `${date}T${startHHMM}:00`,
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: `${date}T${endHHMM}:00`,
        timeZone: "Europe/Madrid",
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: false,
    };

    if (resolvedEmail) {
      event.attendees = [{ email: resolvedEmail }];
    }

    // Check conference support
    const calInfoUrl = `https://www.googleapis.com/calendar/v3/users/me/calendarList/${encodeURIComponent(calendarId)}`;
    const calInfoRes = await fetch(calInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    let queryParam = "";
    if (calInfoRes.ok) {
      const calInfo = await calInfoRes.json();
      const solutions = calInfo.conferenceProperties?.allowedConferenceSolutionTypes || [];
      if (solutions.includes("hangoutsMeet")) {
        event.conferenceData = {
          createRequest: {
            requestId: `booking-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
        queryParam = "?conferenceDataVersion=1";
      }
    }

    const sendUpdates = "sendUpdates=all";
    const separator = queryParam ? "&" : "?";
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events${queryParam}${separator}${sendUpdates}`;

    const calRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!calRes.ok) {
      const errBody = await calRes.text();
      throw new Error(`Calendar API error [${calRes.status}]: ${errBody}`);
    }

    const created = await calRes.json();
    const meetLink = created.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    )?.uri || null;

    return new Response(JSON.stringify({ success: true, eventId: created.id, meetLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
