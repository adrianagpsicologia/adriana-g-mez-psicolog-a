import { permitsOrdinaryAds, updateGoogleAdConsent } from "./ad-consent";

export const GOOGLE_ADS_ID = "AW-1445806545";

// Pending: the conversion label from Google Ads (Goals → Conversions →
// "Reserva completada" → Tag setup). Until it is set, no conversion is sent.
export const BOOKING_CONVERSION_SEND_TO = "";

let loading: Promise<boolean> | undefined;

// Basic route: in consent regions the tag does not load until the visitor
// accepts; elsewhere it loads with consent granted.
export function loadGoogleAds(): Promise<boolean> {
  return (loading ??= (async () => {
    const allowed = await permitsOrdinaryAds();
    if (!allowed) return false;
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    updateGoogleAdConsent("granted");
    if (document.querySelector("script[data-google-ads]")) return true;
    window.gtag("set", "developer_id.dZjgwMW", true);
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ADS_ID);
    const script = document.createElement("script");
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GOOGLE_ADS_ID);
    script.async = true;
    script.dataset["googleAds"] = "";
    document.head.appendChild(script);
    return true;
  })());
}

// Called after a visitor accepts in the consent banner: the first load may
// have been blocked, so reset the guard and try again.
export function enableGoogleAdsAfterAcceptance(): void {
  loading = undefined;
  void loadGoogleAds();
}

// Fires only on the booking-confirmed page and only once the conversion
// label is configured. Never includes patient data: no names, emails,
// phones or consultation reasons — only the anonymous conversion signal.
export async function reportBookingConversion(): Promise<void> {
  if (!BOOKING_CONVERSION_SEND_TO.startsWith(GOOGLE_ADS_ID + "/")) return;
  const loaded = await loadGoogleAds();
  if (!loaded) return;
  window.gtag?.("event", "conversion", { send_to: BOOKING_CONVERSION_SEND_TO });
}
