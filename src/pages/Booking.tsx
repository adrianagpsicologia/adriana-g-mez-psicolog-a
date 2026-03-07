import { useState, useEffect } from "react";
import { User, Users, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_CALENDAR_LINK = "https://calendar.app.google/LyrPpdSjsxyubChb6";

interface ServiceOption {
  id: string;
  icon: typeof User;
  title: string;
  price: string;
  description: string;
  badge?: string;
}

const Booking = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);

  useEffect(() => {
    const load = async () => {
      const [servicesRes, bonosRes] = await Promise.all([
        supabase.from("services").select("*").eq("is_active", true),
        supabase.from("bonos").select("*").eq("is_active", true),
      ]);

      const svc = servicesRes.data || [];
      const bonos = bonosRes.data || [];
      const options: ServiceOption[] = [];

      svc.forEach((s) => {
        options.push({
          id: s.id,
          icon: s.name.toLowerCase().includes("pareja") ? Users : User,
          title: s.name,
          price: `${(s.price_cents / 100).toFixed(0)}€`,
          description: `Sesión de ${s.duration_minutes} minutos`,
        });

        const relatedBonos = bonos.filter((b) => b.service_id === s.id);
        relatedBonos.forEach((b) => {
          const savings = s.price_cents * b.sessions_total - b.price_cents;
          options.push({
            id: `bono-${b.id}`,
            icon: s.name.toLowerCase().includes("pareja") ? Users : User,
            title: b.name,
            price: `${(b.price_cents / 100).toFixed(0)}€`,
            description: `${b.sessions_total} sesiones de ${s.duration_minutes} min${savings > 0 ? ` · Ahorro de ${(savings / 100).toFixed(0)}€` : ""}`,
            badge: savings > 0 ? "Más popular" : undefined,
          });
        });
      });

      setServices(options);
    };
    load();
  }, []);

  const handleContinue = () => {
    window.open(GOOGLE_CALENDAR_LINK, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-wide py-12 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="heading-section mb-3">Reservar cita</h1>
            <p className="body-large text-muted-foreground">
              Selecciona el tipo de sesión y agenda tu cita
            </p>
          </div>

          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                Cargando servicios...
              </div>
            ) : (
              services.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    selected === option.id
                      ? "border-foreground bg-accent/50 shadow-md"
                      : "border-border hover:border-foreground/30 hover:bg-accent/20"
                  }`}
                >
                  {option.badge && (
                    <span className="absolute -top-2.5 right-4 bg-foreground text-background text-xs font-medium px-3 py-0.5 rounded-full">
                      {option.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <option.icon size={20} className="text-foreground" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading font-medium text-base">{option.title}</h3>
                        <span className="font-heading font-semibold text-lg flex-shrink-0">{option.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {selected && (
            <div className="mt-8 text-center animate-fade-in">
              <Button variant="cta" size="lg" className="min-w-[220px]" onClick={handleContinue}>
                Agendar cita
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
