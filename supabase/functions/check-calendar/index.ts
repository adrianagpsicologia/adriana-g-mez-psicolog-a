import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    // sub removed temporarily to test direct auth
    scope: "https://www.googleapis.com/auth/calendar",
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

  // Import the private key
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

  // Exchange JWT for access token
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
    const calendarId = "adriana@adrianagpsicologia.com";

    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "Google Calendar not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Debug: log first chars to diagnose parsing issues
    console.log("JSON first 80 chars:", serviceAccountJson.substring(0, 80));
    
    let parsed: any;
    try {
      parsed = JSON.parse(serviceAccountJson);
    } catch {
      // Maybe double-encoded or wrapped in quotes
      const cleaned = serviceAccountJson.trim().replace(/^["']|["']$/g, '');
      parsed = JSON.parse(cleaned);
    }
    const serviceAccount = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    console.log("Service account email:", serviceAccount.client_email);
    console.log("Service account client_id:", serviceAccount.client_id);
    console.log("Service account project_id:", serviceAccount.project_id);
    console.log("Private key starts with:", serviceAccount.private_key?.substring(0, 30));
    const accessToken = await getAccessToken(serviceAccount);

    console.log("Calendar ID being queried:", calendarId);

    // Ensure the shared calendar is in the service account's calendar list
    const addCalRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: calendarId }),
    });
    const addCalData = await addCalRes.json();
    console.log("Add calendar result:", addCalRes.status, JSON.stringify(addCalData));

    const timeMin = `${date}T00:00:00+01:00`;
    const timeMax = `${date}T23:59:59+01:00`;

    // Use FreeBusy API - works with public/shared calendars
    const freeBusyUrl = `https://www.googleapis.com/calendar/v3/freeBusy`;
    const freeBusyRes = await fetch(freeBusyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
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

    let busySlots: { start: string; end: string }[] = [];
    let freeBusyWorked = false;

    if (freeBusyRes.ok && freeBusyData.calendars?.[calendarId]) {
      const calendarBusy = freeBusyData.calendars[calendarId];
      
      if (calendarBusy.errors?.length) {
        console.error("FreeBusy calendar errors:", JSON.stringify(calendarBusy.errors));
        // Don't treat as success - fall through to Events API
      } else {
        freeBusyWorked = true;
        busySlots = (calendarBusy.busy || []).map((slot: any) => {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          const startLocal = slot.start.includes("+") || slot.start.includes("Z")
            ? `${String(startDate.getUTCHours() + 1).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`
            : slot.start.substring(11, 16);
          const endLocal = slot.end.includes("+") || slot.end.includes("Z")
            ? `${String(endDate.getUTCHours() + 1).padStart(2, "0")}:${String(endDate.getUTCMinutes()).padStart(2, "0")}`
            : slot.end.substring(11, 16);
          return { start: startLocal, end: endLocal };
        });
      }
    }

    if (!freeBusyWorked) {
      console.log("FreeBusy failed or no data, trying Events API...");
      
      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&timeZone=Europe%2FMadrid`;
      const calRes = await fetch(eventsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!calRes.ok) {
        const calErr = await calRes.text();
        console.error("Events API error:", calRes.status, calErr);
        // Return empty instead of throwing - graceful degradation
        busySlots = [];
      } else {
        const calData = await calRes.json();
        console.log("Events API returned", calData.items?.length || 0, "events");
        busySlots = (calData.items || [])
          .filter((event: any) => {
            const hasTime = event.start?.dateTime && event.end?.dateTime;
            const isAllDay = event.start?.date && event.end?.date;
            return (hasTime || isAllDay) && event.status !== "cancelled";
          })
          .map((event: any) => {
            if (event.start.date) return { start: "00:00", end: "23:59" };
            return {
              start: event.start.dateTime.substring(11, 16),
              end: event.end.dateTime.substring(11, 16),
            };
          });
      }
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
