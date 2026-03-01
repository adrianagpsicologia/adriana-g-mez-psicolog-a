import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date } = await req.json();
    if (!date) {
      return new Response(JSON.stringify({ error: "date is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    const calendarId = "adriana@adrianagpsicologia.com";

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Google API Key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timeMin = `${date}T00:00:00+01:00`;
    const timeMax = `${date}T23:59:59+01:00`;

    // Use FreeBusy API with API key (works with public calendars)
    const freeBusyUrl = `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`;
    const freeBusyRes = await fetch(freeBusyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: "Europe/Madrid",
        items: [{ id: calendarId }],
      }),
    });

    const freeBusyData = await freeBusyRes.json();
    console.log("FreeBusy response:", JSON.stringify(freeBusyData));

    let busySlots: { start: string; end: string }[] = [];

    if (freeBusyRes.ok && freeBusyData.calendars?.[calendarId]) {
      const calendarBusy = freeBusyData.calendars[calendarId];

      if (calendarBusy.errors?.length) {
        console.error("FreeBusy calendar errors:", JSON.stringify(calendarBusy.errors));
      } else {
        busySlots = (calendarBusy.busy || []).map((slot: any) => {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          // Convert to Europe/Madrid local time
          const startLocal = slot.start.includes("+") || slot.start.includes("Z")
            ? `${String(startDate.getUTCHours() + 1).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`
            : slot.start.substring(11, 16);
          const endLocal = slot.end.includes("+") || slot.end.includes("Z")
            ? `${String(endDate.getUTCHours() + 1).padStart(2, "0")}:${String(endDate.getUTCMinutes()).padStart(2, "0")}`
            : slot.end.substring(11, 16);
          return { start: startLocal, end: endLocal };
        });
      }
    } else if (!freeBusyRes.ok) {
      console.error("FreeBusy API error:", freeBusyRes.status, JSON.stringify(freeBusyData));
    }

    console.log("Busy slots:", JSON.stringify(busySlots));

    return new Response(JSON.stringify({ busySlots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error checking calendar:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
