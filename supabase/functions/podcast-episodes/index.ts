import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FEED_URL =
  "https://www.youtube.com/feeds/videos.xml?channel_id=UCJYTo3Lxt9NpXBhc3qdGJxA";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const unescapeXml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Feed responded ${res.status}`);
    const xml = await res.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(
      (m) => m[1],
    );

    const episodes: { id: string; title: string; date: string }[] = [];
    for (const entry of entries) {
      const link =
        entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
      // Skip Shorts: only full episodes belong in the podcast list.
      if (link.includes("/shorts/")) continue;

      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      const rawTitle = unescapeXml(
        entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? "",
      );
      const title = rawTitle
        .replace(/\s*[|·–-]\s*Qué Hago en esta Vida\s*$/i, "")
        .trim();
      const date = (
        entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? ""
      ).slice(0, 10);

      if (id && title) episodes.push({ id, title, date });
      if (episodes.length === 3) break;
    }

    return new Response(JSON.stringify({ episodes }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("podcast-episodes failed:", error);
    return new Response(JSON.stringify({ episodes: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
