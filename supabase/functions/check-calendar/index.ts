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
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");

    if (!serviceAccountJson || !calendarId) {
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
    const accessToken = await getAccessToken(serviceAccount);

    console.log("Calendar ID being queried:", calendarId);

    // Query events for the given date using Madrid timezone
    // Google Calendar API requires RFC3339 timestamps
    const timeMin = `${date}T00:00:00+01:00`;
    const timeMax = `${date}T23:59:59+01:00`;
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&timeZone=Europe%2FMadrid`;

    console.log("Calendar API URL:", url);

    const calRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!calRes.ok) {
      const errBody = await calRes.text();
      throw new Error(`Calendar API error [${calRes.status}]: ${errBody}`);
    }

    const calData = await calRes.json();
    
    console.log("Total events found:", (calData.items || []).length);
    console.log("Events:", JSON.stringify((calData.items || []).map((e: any) => ({
      summary: e.summary,
      start: e.start,
      end: e.end,
      status: e.status,
    }))));

    // Extract busy time ranges (HH:MM format) preserving the event's local timezone
    const busySlots = (calData.items || [])
      .filter((event: any) => {
        // Include all-day events too (they have start.date instead of start.dateTime)
        const hasTime = event.start?.dateTime && event.end?.dateTime;
        const isAllDay = event.start?.date && event.end?.date;
        return (hasTime || isAllDay) && event.status !== "cancelled";
      })
      .map((event: any) => {
        if (event.start.date) {
          // All-day event - block the entire day
          return { start: "00:00", end: "23:59" };
        }
        // dateTime includes timezone offset (e.g. "2026-02-17T11:00:00+01:00")
        // Extract the local time directly from the ISO string to avoid UTC conversion
        const startLocal = event.start.dateTime.substring(11, 16); // "HH:MM"
        const endLocal = event.end.dateTime.substring(11, 16);
        return { start: startLocal, end: endLocal };
      });

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
