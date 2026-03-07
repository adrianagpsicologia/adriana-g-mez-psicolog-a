import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
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
    const cleaned = raw.trim().replace(/^["']|["']$/g, '');
    parsed = JSON.parse(cleaned);
  }
  return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
}

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

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID") || "c_bbf6aa6d0a95567141bd23cdb9b71dc9ed9aedd641e3951484768e9beb3689cd@group.calendar.google.com";

    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "Google Service Account not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccount = parseServiceAccount(serviceAccountJson);
    const accessToken = await getAccessToken(serviceAccount);

    const timeMin = `${date}T00:00:00+01:00`;
    const timeMax = `${date}T23:59:59+01:00`;

    let busySlots: { start: string; end: string }[] = [];

    // Try FreeBusy API first
    const freeBusyRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: "Europe/Madrid",
        items: [{ id: calendarId }],
      }),
    });

    const freeBusyData = await freeBusyRes.json();
    console.log("FreeBusy response:", JSON.stringify(freeBusyData));

    let freeBusyWorked = false;
    if (freeBusyRes.ok && freeBusyData.calendars?.[calendarId]) {
      const calendarBusy = freeBusyData.calendars[calendarId];
      if (!calendarBusy.errors?.length) {
        freeBusyWorked = true;
        busySlots = (calendarBusy.busy || []).map((slot: any) => {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          const startLocal = startDate.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false });
          const endLocal = endDate.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false });
          return { start: startLocal, end: endLocal };
        });
      }
    }

    // Fallback: use Events API if FreeBusy failed
    if (!freeBusyWorked) {
      console.log("FreeBusy failed, trying Events API as fallback...");
      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
      const eventsRes = await fetch(eventsUrl, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      const eventsData = await eventsRes.json();
      console.log("Events API response status:", eventsRes.status);

      if (eventsRes.ok && eventsData.items) {
        busySlots = eventsData.items
          .filter((ev: any) => ev.status !== "cancelled" && ev.start?.dateTime)
          .map((ev: any) => {
            const startDate = new Date(ev.start.dateTime);
            const endDate = new Date(ev.end.dateTime);
            const startLocal = startDate.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false });
            const endLocal = endDate.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false });
            return { start: startLocal, end: endLocal };
          });
        console.log("Events API found busy slots:", JSON.stringify(busySlots));
      } else {
        console.error("Events API also failed:", eventsRes.status, JSON.stringify(eventsData));
      }
    }

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
