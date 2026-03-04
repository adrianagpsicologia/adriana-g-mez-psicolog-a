import { useState } from "react";
import { User, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GOOGLE_CALENDAR_LINK = "https://calendar.app.google/BExC7nxrzS8QfKTC9";

const serviceOptions = [
  {
    id: "individual",
    icon: User,
    title: "Sesión Individual",
    price: "60€",
    description: "Sesión de 50 minutos",
  },
  {
    id: "individual-bono",
    icon: User,
    title: "Bono 4 Sesiones Individuales",
    price: "200€",
    description: "4 sesiones de 50 minutos · Ahorro de 40€",
    badge: "Más popular",
  },
  {
    id: "pareja",
    icon: Users,
    title: "Sesión de Pareja",
    price: "70€",
    description: "Sesión de 50 minutos",
  },
  {
    id: "pareja-bono",
    icon: Users,
    title: "Bono 4 Sesiones de Pareja",
    price: "240€",
    description: "4 sesiones de 50 minutos · Ahorro de 40€",
  },
];

const Booking = () => {
  const [selected, setSelected] = useState<string | null>(null);

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
              Selecciona el tipo de sesión que deseas reservar
            </p>
          </div>

          <div className="space-y-3">
            {serviceOptions.map((option) => (
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
                      <h3 className="font-heading font-medium text-base">
                        {option.title}
                      </h3>
                      <span className="font-heading font-semibold text-lg flex-shrink-0">
                        {option.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="cta"
              size="lg"
              className="min-w-[220px]"
              disabled={!selected}
              asChild={!!selected}
            >
              {selected ? (
                <a
                  href={GOOGLE_CALENDAR_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Continuar con la reserva
                  <ArrowRight size={18} className="ml-2" />
                </a>
              ) : (
                <span>
                  Selecciona una opción
                </span>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Serás redirigido a Google Calendar para elegir fecha y hora
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;
