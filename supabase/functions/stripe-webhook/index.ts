import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing Stripe config", { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, serviceId, bonoId, bookingDate, startTime, endTime } = session.metadata || {};

    if (!userId || !serviceId) {
      console.error("Missing metadata in checkout session");
      return new Response("Missing metadata", { status: 400 });
    }

    if (bonoId) {
      // Bono purchase: create patient_bono and first booking
      const { data: bonoData } = await supabase
        .from("bonos")
        .select("sessions_total")
        .eq("id", bonoId)
        .single();

      if (bonoData) {
        const { data: patientBono } = await supabase.from("patient_bonos").insert({
          user_id: userId,
          bono_id: bonoId,
          sessions_remaining: bonoData.sessions_total - 1,
          sessions_total: bonoData.sessions_total,
          payment_method: "stripe",
          payment_status: "paid",
          stripe_session_id: session.id,
        }).select().single();

        // Create first booking from bono
        await supabase.from("bookings").insert({
          user_id: userId,
          service_id: serviceId,
          patient_bono_id: patientBono?.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          status: "confirmed",
          payment_method: "stripe",
          payment_status: "paid",
          stripe_session_id: session.id,
        });
      }
    } else {
      // Single session booking
      await supabase.from("bookings").insert({
        user_id: userId,
        service_id: serviceId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        status: "confirmed",
        payment_method: "stripe",
        payment_status: "paid",
        stripe_session_id: session.id,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
