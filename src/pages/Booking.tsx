import { useState, useRef } from "react";
import { User, Users, ArrowLeft, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GOOGLE_CALENDAR_EMBED = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1cM9pW0G5Ox1ypOaCdXMdT8e2ZQbnkYYlsa0qKXd3gXJw7C1OHTQF_Ff_J3bDBcEvMUePe1hRE?gv=true";

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
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const handleContinue = () => {
    setShowCalendar(true);
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
              Selecciona el tipo de sesión que deseas reservar
            </p>
          </div>

          <div className="space-y-3">
            {serviceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => { setSelected(option.id); setShowCalendar(false); }}
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

          {selected && !showCalendar && (
            <div className="mt-8 text-center animate-fade-in">
              <Button
                variant="cta"
                size="lg"
                className="min-w-[220px]"
                onClick={handleContinue}
              >
                Elegir fecha y hora
                <ArrowDown size={18} className="ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Embedded Google Calendar */}
        {showCalendar && (
          <div ref={calendarRef} className="mt-12 max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-heading text-xl font-medium">Elige tu fecha y hora</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {serviceOptions.find(o => o.id === selected)?.title} — {serviceOptions.find(o => o.id === selected)?.price}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-border shadow-soft bg-background">
              <iframe
                src={GOOGLE_CALENDAR_EMBED}
                style={{ border: 0 }}
                width="100%"
                height="700"
                title="Reservar cita - Google Calendar"
                className="w-full"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Calendario proporcionado por Google Calendar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
