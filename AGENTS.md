# Project conventions

- Keep the podcast as a dedicated home-page section with scoped semantic color tokens and an imported asset pointer, so its identity remains independent of the therapy site's theme.
- GitHub Pages deployment must provide a reservation directory entry, an app-shell 404 fallback, and CNAME in the published artifact, because Pages does not rewrite client-side routes automatically.
- Google Ads tracking keeps consent defaults in index.html, region/choice logic in src/lib/ad-consent.ts, and tag loading in src/lib/google-ads.ts, so there is exactly one AW-1445806545 install and no conversion fires before a confirmed booking.
- Podcast episodes come from the podcast-episodes edge function (YouTube RSS with Shorts filtered out) with a hardcoded fallback list in PodcastSection, so the section shows the latest full episodes without a YouTube API key.