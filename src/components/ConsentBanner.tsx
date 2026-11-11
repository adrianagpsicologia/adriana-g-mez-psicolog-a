import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CONSENT_NOTICE_TEXT,
  recordAdChoice,
  requiresAdConsent,
  savedAdChoice,
} from "@/lib/ad-consent";
import { enableGoogleAdsAfterAcceptance } from "@/lib/google-ads";

export const COOKIE_SETTINGS_EVENT = "open-cookie-settings";

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requiresAdConsent().then((required) => {
      if (required && savedAdChoice() === null) setVisible(true);
    });
    const reopen = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const decide = (decision: "granted" | "denied") => {
    recordAdChoice(decision);
    if (decision === "granted") enableGoogleAdsAfterAcceptance();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Configuración de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="container-wide">
        <div className="card-elevated border border-border max-w-2xl mx-auto">
          <h2 className="font-heading text-xl font-medium mb-2">
            Cookies de medición
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {CONSENT_NOTICE_TEXT}{" "}
            <Link to="/privacidad" className="underline underline-offset-2">
              Más información
            </Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="cta"
              className="flex-1"
              onClick={() => decide("granted")}
            >
              Aceptar
            </Button>
            <Button
              variant="ctaOutline"
              className="flex-1"
              onClick={() => decide("denied")}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
