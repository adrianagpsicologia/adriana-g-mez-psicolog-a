import { useState, useEffect, useMemo, useCallback } from "react";
import { User, Users, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BookingCalendar from "@/components/BookingCalendar";
import { format, addDays, startOfDay, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface ServiceOption {
  id: string;
  icon: typeof User;
  title: string;
  price: string;
  priceCents: number;
  description: string;
  badge?: string;
  serviceId: string;
  bonoId?: string;
  durationMinutes: number;
}

const Booking = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [busySlots, setBusySlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [step, setStep] = useState<"service" | "datetime">("service");

  // Load services, availability, blocked dates
  useEffect(() => {
    const load = async () => {
      const [servicesRes, bonosRes, availRes, blockedRes] = await Promise.all([
        supabase.from("services").select("*").eq("is_active", true),
        supabase.from("bonos").select("*").eq("is_active", true),
        supabase.from("availability").select("*").eq("is_active", true),
        supabase.from("blocked_dates").select("blocked_date"),
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
          priceCents: s.price_cents,
          description: `Sesión de ${s.duration_minutes} minutos`,
          serviceId: s.id,
          durationMinutes: s.duration_minutes,
        });

        const relatedBonos = bonos.filter((b) => b.service_id === s.id);
        relatedBonos.forEach((b) => {
          const savings = s.price_cents * b.sessions_total - b.price_cents;
          options.push({
            id: `bono-${b.id}`,
            icon: s.name.toLowerCase().includes("pareja") ? Users : User,
            title: b.name,
            price: `${(b.price_cents / 100).toFixed(0)}€`,
            priceCents: b.price_cents,
            description: `${b.sessions_total} sesiones de ${s.duration_minutes} min${savings > 0 ? ` · Ahorro de ${(savings / 100).toFixed(0)}€` : ""}`,
            badge: savings > 0 ? "Más popular" : undefined,
            serviceId: s.id,
            bonoId: b.id,
            durationMinutes: s.duration_minutes,
          });
        });
      });

      setServices(options);
      setAvailability(availRes.data || []);
      setBlockedDates((blockedRes.data || []).map((b) => b.blocked_date));
    };
    load();
  }, []);

  // Compute available dates (next 60 days based on availability table)
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 1; i <= 60; i++) {
      const d = addDays(today, i);
      const jsDay = getDay(d); // 0=Sun, 1=Mon...
      const dbDay = jsDay === 0 ? 7 : jsDay; // Convert to 1=Mon...7=Sun
      const hasAvailability = availability.some((a) => a.day_of_week === dbDay && a.is_active);
      const dateStr = format(d, "yyyy-MM-dd");
      const isBlocked = blockedDates.includes(dateStr);
      if (hasAvailability && !isBlocked) {
        dates.push(d);
      }
    }
    return dates;
  }, [availability, blockedDates]);

  // Load busy slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    const fetchBusy = async () => {
      setLoadingSlots(true);
      setBusySlots([]);
      setSelectedTime(null);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const { data, error } = await supabase.functions.invoke("check-calendar", {
          body: { date: dateStr },
        });
        if (error) throw error;
        setBusySlots(data?.busySlots || []);
      } catch (e: any) {
        console.error("Error fetching busy slots:", e);
        toast.error("Error al consultar disponibilidad");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBusy();
  }, [selectedDate]);

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Generate available time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selected) return [];
    const service = services.find((s) => s.id === selected);
    if (!service) return [];

    const jsDay = getDay(selectedDate);
    const dbDay = jsDay === 0 ? 7 : jsDay;
    const dayAvailability = availability.filter((a) => a.day_of_week === dbDay && a.is_active);

    const slots: { start: string; end: string }[] = [];

    dayAvailability.forEach((a) => {
      const [startH, startM] = a.start_time.split(":").map(Number);
      const [endH, endM] = a.end_time.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = service.durationMinutes;

      for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
        const sH = String(Math.floor(m / 60)).padStart(2, "0");
        const sM = String(m % 60).padStart(2, "0");
        const eMin = m + duration;
        const eH = String(Math.floor(eMin / 60)).padStart(2, "0");
        const eM = String(eMin % 60).padStart(2, "0");
        slots.push({ start: `${sH}:${sM}`, end: `${eH}:${eM}` });
      }
    });

    // Filter out busy slots
    return slots.filter((slot) => {
      const slotStart = toMinutes(slot.start);
      const slotEnd = toMinutes(slot.end);
      return !busySlots.some((busy) => {
        const busyStart = toMinutes(busy.start);
        const busyEnd = toMinutes(busy.end);
        return slotStart < busyEnd && slotEnd > busyStart;
      });
    });
  }, [selectedDate, selected, availability, busySlots, services]);

  const handleSelectService = (id: string) => {
    setSelected(id);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep("service");
  };

  const handleContinueToDatetime = () => {
    setStep("datetime");
  };

  const handleCheckout = async () => {
    if (!selected || !selectedDate || !selectedTime) return;

    if (!user) {
      toast.info("Inicia sesión para completar tu reserva");
      navigate("/auth?redirect=/reservar");
      return;
    }

    const service = services.find((s) => s.id === selected);
    if (!service) return;

    const slot = timeSlots.find((s) => s.start === selectedTime);
    if (!slot) return;

    setLoadingCheckout(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount: service.priceCents,
          name: service.title,
          serviceId: service.serviceId,
          bonoId: service.bonoId || "",
          bookingDate: dateStr,
          startTime: slot.start + ":00",
          endTime: slot.end + ":00",
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: any) {
      console.error("Checkout error:", e);
      toast.error("Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const selectedService = services.find((s) => s.id === selected);

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
              {step === "service"
                ? "Selecciona el tipo de sesión que deseas reservar"
                : "Elige tu fecha y hora preferida"}
            </p>
          </div>

          {step === "service" && (
            <>
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
                      onClick={() => handleSelectService(option.id)}
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
                  <Button variant="cta" size="lg" className="min-w-[220px]" onClick={handleContinueToDatetime}>
                    Elegir fecha y hora
                  </Button>
                </div>
              )}
            </>
          )}

          {step === "datetime" && selectedService && (
            <div className="animate-fade-in">
              {/* Selected service summary */}
              <div className="mb-8 p-4 rounded-xl border border-border bg-accent/20 flex items-center justify-between">
                <div>
                  <p className="font-heading font-medium">{selectedService.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-semibold text-lg">{selectedService.price}</p>
                  <button onClick={() => setStep("service")} className="text-xs text-muted-foreground underline hover:text-foreground">
                    Cambiar
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <div className="flex justify-center mb-8">
                <BookingCalendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="animate-fade-in">
                  <h3 className="font-heading font-medium text-center mb-4">
                    Horarios disponibles — {format(selectedDate, "d 'de' MMMM", { locale: undefined })}
                  </h3>
                  {loadingSlots ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Consultando disponibilidad...
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">
                      No hay horarios disponibles este día. Prueba otra fecha.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-md mx-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => setSelectedTime(slot.start)}
                          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedTime === slot.start
                              ? "border-foreground bg-foreground text-background shadow-md"
                              : "border-border hover:border-foreground/40 hover:bg-accent/30"
                          }`}
                        >
                          <Clock size={14} />
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Confirm & Pay */}
              {selectedTime && (
                <div className="mt-8 text-center animate-fade-in">
                  <div className="mb-4 text-sm text-muted-foreground">
                    {selectedService.title} · {format(selectedDate!, "d/MM/yyyy")} · {selectedTime} — <span className="font-semibold text-foreground">{selectedService.price}</span>
                  </div>
                  <Button
                    variant="cta"
                    size="lg"
                    className="min-w-[220px]"
                    onClick={handleCheckout}
                    disabled={loadingCheckout}
                  >
                    {loadingCheckout ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Procesando...
                      </>
                    ) : (
                      `Pagar ${selectedService.price}`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
