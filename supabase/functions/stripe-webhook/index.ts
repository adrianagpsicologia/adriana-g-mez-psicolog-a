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
    event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET);
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

    // Get patient name and service name for calendar event
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    const { data: service } = await supabase
      .from("services")
      .select("name")
      .eq("id", serviceId)
      .single();

    if (bonoId) {
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

        await supabase.from("bookings").insert({
          user_id: userId,
          service_id: serviceId,
          patient_bono_id: patientBono?.id,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          status: "pending",
          payment_method: "stripe",
          payment_status: "paid",
          stripe_session_id: session.id,
        });
      }
    } else {
      await supabase.from("bookings").insert({
        user_id: userId,
        service_id: serviceId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        payment_method: "stripe",
        payment_status: "paid",
        stripe_session_id: session.id,
      });
    }

    // Send notification emails
    try {
      const SUPABASE_URL_ENV = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;

      const patientName = profile?.full_name || "Paciente";
      const serviceName = service?.name || "Sesión";

      // Format date nicely
      const dateObj = new Date(bookingDate + "T12:00:00");
      const dateFormatted = dateObj.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const timeFormatted = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;

      // Email to patient
      await fetch(`${SUPABASE_URL_ENV}/functions/v1/send-booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: "patient_request_sent",
          userId,
          patientName,
          serviceName,
          date: dateFormatted,
          time: timeFormatted,
        }),
      });

      // Email to admin
      await fetch(`${SUPABASE_URL_ENV}/functions/v1/send-booking-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: "admin_new_request",
          patientName,
          serviceName,
          date: dateFormatted,
          time: timeFormatted,
        }),
      });
    } catch (e) {
      console.error("Error sending booking emails from webhook:", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
