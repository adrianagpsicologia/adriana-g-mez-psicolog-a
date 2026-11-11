// Advertising consent state for Google Ads measurement.
// The plain choice lives in localStorage under ADS_CHOICE_KEY; the evidence
// record (who decided, when, and which notice was shown) lives alongside it
// under ADS_EVIDENCE_KEY.
export const ADS_CHOICE_KEY = "ads_consent";
export const ADS_EVIDENCE_KEY = "ads_consent_evidence";
export const CONSENT_NOTICE_VERSION = 1;
export const CONSENT_NOTICE_TEXT =
  "Usamos cookies de medición de Google Ads para saber si nuestros anuncios funcionan. Puedes aceptarlas o rechazarlas; tu elección se guarda y puedes cambiarla en cualquier momento desde «Configurar cookies» en el pie de página.";

const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let regionLookup: Promise<boolean> | undefined;

export function requiresAdConsent(): Promise<boolean> {
  return (regionLookup ??= resolveRegion());
}

async function resolveRegion(): Promise<boolean> {
  try {
    const response = await fetch("/cdn-cgi/trace", {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return true;
    const trace = await response.text();
    const host = trace.match(/^h=(.+)$/m)?.[1]?.trim().toLowerCase();
    const country = trace.match(/^loc=([A-Z0-9]{2})$/m)?.[1];
    // Unknown, proxied, Tor or mismatched host: treat as a consent region.
    if (host !== location.hostname || !country || country === "XX" || country === "T1") {
      return true;
    }
    return CONSENT_COUNTRIES.has(country);
  } catch {
    return true;
  }
}

function currentAdChoice(): string | null {
  if (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  ) {
    return "denied";
  }
  return localStorage.getItem(ADS_CHOICE_KEY);
}

export function savedAdChoice(): string | null {
  return localStorage.getItem(ADS_CHOICE_KEY);
}

export function explicitAdAcceptance(): boolean {
  return currentAdChoice() === "granted";
}

export async function permitsOrdinaryAds(): Promise<boolean> {
  const saved = currentAdChoice();
  if (saved !== null) return saved === "granted";
  const required = await requiresAdConsent();
  const latest = currentAdChoice();
  return latest !== null ? latest === "granted" : !required;
}

export function recordAdChoice(decision: "granted" | "denied"): void {
  localStorage.setItem(ADS_CHOICE_KEY, decision);
  localStorage.setItem(
    ADS_EVIDENCE_KEY,
    JSON.stringify({
      choice: decision,
      at: new Date().toISOString(),
      version: CONSENT_NOTICE_VERSION,
      notice: CONSENT_NOTICE_TEXT,
    }),
  );
  updateGoogleAdConsent(decision);
}

export function updateGoogleAdConsent(decision: "granted" | "denied"): void {
  if (currentAdChoice() === "denied") decision = "denied";
  if (decision === "denied") window.gtag?.("set", "user_data", null);
  window.gtag?.("consent", "update", {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
  });
}
