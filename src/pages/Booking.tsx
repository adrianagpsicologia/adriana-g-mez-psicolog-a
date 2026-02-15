import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfDay, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import BookingCalendar from "@/components/BookingCalendar";

interface Service {
  id: string;
  name: string;
  price_cents: number;
  duration_minutes: number;
}

interface Bono {
  id: string;
  name: string;
  sessions_total: number;
  price_cents: number;
  service_id: string;
}

interface PatientBono {
  id: string;
  sessions_remaining: number;
  bono: { name: string; service_id: string };
}

interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

const Booking = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<"service" | "date" | "confirm">("service");
  const [services, setServices] = useState<Service[]>([]);
  const [bonos, setBonos] = useState<Bono[]>([]);
  const [patientBonos, setPatientBonos] = useState<PatientBono[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<{ booking_date: string; start_time: string }[]>([]);
  const [calendarBusySlots, setCalendarBusySlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBono, setSelectedBono] = useState<Bono | null>(null);
  const [useExistingBono, setUseExistingBono] = useState<PatientBono | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [paymentMethod] = useState<"stripe">("stripe");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    const [servicesRes, bonosRes, availRes, blockedRes] = await Promise.all([
      supabase.from("services").select("*").eq("is_active", true),
      supabase.from("bonos").select("*").eq("is_active", true),
      supabase.from("availability").select("*").eq("is_active", true),
      supabase.from("blocked_dates").select("blocked_date"),
    ]);

    if (servicesRes.data) setServices(servicesRes.data);
    if (bonosRes.data) setBonos(bonosRes.data);
    if (availRes.data) setAvailability(availRes.data);
    if (blockedRes.data) setBlockedDates(blockedRes.data.map((d) => d.blocked_date));

    if (user) {
      const { data } = await supabase
        .from("patient_bonos")
        .select("*, bono:bonos(name, service_id)")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .gt("sessions_remaining", 0);
      if (data) setPatientBonos(data as any);
    }
  };

  const selectService = (service: Service) => {
    setSelectedService(service);
    setSelectedBono(null);
    setUseExistingBono(null);

    // Check if patient has an active bono for this service
    const activeBono = patientBonos.find((pb) => pb.bono.service_id === service.id);
    if (activeBono) {
      setUseExistingBono(activeBono);
    }

    setStep("date");
    fetchBookingsForDate(service);
  };

  const selectBono = (bono: Bono) => {
    const service = services.find((s) => s.id === bono.service_id);
    if (service) {
      setSelectedService(service);
      setSelectedBono(bono);
      setUseExistingBono(null);
      setStep("date");
      fetchBookingsForDate(service);
    }
  };

  const fetchBookingsForDate = async (service: Service) => {
    const { data } = await supabase
      .from("bookings")
      .select("booking_date, start_time")
      .in("status", ["confirmed", "pending"])
      .gte("booking_date", format(new Date(), "yyyy-MM-dd"));
    if (data) setExistingBookings(data);
  };

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());

    for (let i = 1; i <= 60; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      const dateStr = format(date, "yyyy-MM-dd");

      if (blockedDates.includes(dateStr)) continue;
      if (availability.some((a) => a.day_of_week === dayOfWeek)) {
        dates.push(date);
      }
    }
    return dates;
  };

  const fetchCalendarBusy = async (date: Date) => {
    setLoadingSlots(true);
    setCalendarBusySlots([]);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const { data, error } = await supabase.functions.invoke("check-calendar", {
        body: { date: dateStr },
      });
      if (!error && data?.busySlots) {
        setCalendarBusySlots(data.busySlots);
      }
    } catch (e) {
      console.error("Error fetching calendar:", e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek);
    const slots: TimeSlot[] = [];

    for (const avail of dayAvailability) {
      const [startH] = avail.start_time.split(":").map(Number);
      const [endH] = avail.end_time.split(":").map(Number);
      const duration = selectedService?.duration_minutes || 50;

      for (let hour = startH; hour < endH; hour++) {
        const slotStart = `${String(hour).padStart(2, "0")}:00`;
        const slotEndMin = hour * 60 + duration;
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

        if (slotEndMin > endH * 60) continue;

        // Check if slot is already booked
        const isBooked = existingBookings.some(
          (b) => b.booking_date === dateStr && b.start_time === slotStart + ":00"
        );

        // Check if slot overlaps with Google Calendar busy times
        const slotStartMin = hour * 60;
        const isBusyInCalendar = calendarBusySlots.some((busy) => {
          const [bStartH, bStartM] = busy.start.split(":").map(Number);
          const [bEndH, bEndM] = busy.end.split(":").map(Number);
          const busyStart = bStartH * 60 + bStartM;
          const busyEnd = bEndH * 60 + bEndM;
          return slotStartMin < busyEnd && slotEndMin > busyStart;
        });

        if (!isBooked && !isBusyInCalendar) {
          slots.push({ start: slotStart, end: slotEnd });
        }
      }
    }
    return slots;
  };

  const sendBookingEmails = async (bookingDate: string, startTime: string, endTime: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user!.id)
        .single();

      const patientName = profile?.full_name || user!.email || "Paciente";
      const serviceName = selectedService?.name || "Sesión";
      const dateFormatted = format(selectedDate!, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      const timeFormatted = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;

      // Send to patient
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "patient_request_sent",
          patientEmail: user!.email,
          patientName,
          serviceName,
          date: dateFormatted,
          time: timeFormatted,
        },
      });

      // Send to admin
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "admin_new_request",
          patientEmail: user!.email,
          patientName,
          serviceName,
          date: dateFormatted,
          time: timeFormatted,
        },
      });
    } catch (e) {
      console.error("Error sending booking emails:", e);
    }
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user) return;
    setSubmitting(true);

    try {
      const bookingDate = format(selectedDate, "yyyy-MM-dd");

      if (useExistingBono) {
        const { error } = await supabase.from("bookings").insert({
          user_id: user.id,
          service_id: selectedService.id,
          patient_bono_id: useExistingBono.id,
          booking_date: bookingDate,
          start_time: selectedTime.start + ":00",
          end_time: selectedTime.end + ":00",
          status: "pending",
          payment_method: "stripe",
          payment_status: "paid",
        });

        if (error) throw error;

        await supabase
          .from("patient_bonos")
          .update({ sessions_remaining: useExistingBono.sessions_remaining - 1 })
          .eq("id", useExistingBono.id);

        await sendBookingEmails(bookingDate, selectedTime.start + ":00", selectedTime.end + ":00");

        toast({ title: "Solicitud enviada", description: "Recibirás un email de confirmación cuando revisemos tu cita." });
        navigate("/portal");
        return;
      }

      // Stripe payment
      const amount = selectedBono ? selectedBono.price_cents : selectedService.price_cents;
      const itemName = selectedBono ? selectedBono.name : selectedService.name;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount,
          name: itemName,
          serviceId: selectedService.id,
          bonoId: selectedBono?.id || null,
          bookingDate,
          startTime: selectedTime.start + ":00",
          endTime: selectedTime.end + ":00",
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const availableDates = step === "date" ? getAvailableDates() : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/portal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">Mi portal</span>
          </Link>
          <h1 className="font-heading text-xl font-medium">Reservar cita</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="container-narrow py-8">
        {/* 24h policy */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-border mb-8">
          <AlertCircle size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Recuerda: las citas pueden modificarse hasta <strong className="text-foreground">24h antes</strong>. 
            Pasado ese tiempo, la sesión se marcará como realizada.
          </p>
        </div>

        {/* Step 1: Select service */}
        {step === "service" && (
          <div>
            <h2 className="heading-card mb-6">¿Qué tipo de sesión necesitas?</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Sesiones individuales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => selectService(service)}
                      className="card-elevated text-left hover:ring-2 hover:ring-foreground/20"
                    >
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
                      <p className="text-2xl font-heading font-semibold mt-2">{service.price_cents / 100}€</p>
                      {patientBonos.find((pb) => pb.bono.service_id === service.id) && (
                        <span className="inline-block mt-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                          Tienes bono activo
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {bonos.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Bonos (ahorra más)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {bonos.map((bono) => (
                      <button
                        key={bono.id}
                        onClick={() => selectBono(bono)}
                        className="card-elevated text-left hover:ring-2 hover:ring-foreground/20"
                      >
                        <h4 className="font-medium">{bono.name}</h4>
                        <p className="text-sm text-muted-foreground">{bono.sessions_total} sesiones</p>
                        <p className="text-2xl font-heading font-semibold mt-2">{bono.price_cents / 100}€</p>
                        <p className="text-xs text-muted-foreground">
                          ({Math.round(bono.price_cents / bono.sessions_total / 100)}€/sesión)
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select date & time */}
        {step === "date" && selectedService && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => { setStep("service"); setSelectedDate(null); setSelectedTime(null); }} className="mb-4">
              <ArrowLeft size={14} />
              Cambiar servicio
            </Button>

            <h2 className="heading-card mb-2">
              {selectedBono ? selectedBono.name : selectedService.name}
              {useExistingBono && " (con bono)"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Elige fecha y hora para tu primera sesión</p>

            {/* Date picker - Calendar grid */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Fecha</h3>
              <BookingCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  fetchCalendarBusy(date);
                }}
              />
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Hora</h3>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Comprobando disponibilidad...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getTimeSlotsForDate(selectedDate).map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          selectedTime?.start === slot.start
                            ? "bg-foreground text-background"
                            : "bg-secondary hover:bg-accent"
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                    {getTimeSlotsForDate(selectedDate).length === 0 && (
                      <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedTime && (
              <Button variant="cta" onClick={() => setStep("confirm")}>
                Continuar
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Confirm & pay */}
        {step === "confirm" && selectedService && selectedDate && selectedTime && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setStep("date")} className="mb-4">
              <ArrowLeft size={14} />
              Cambiar fecha
            </Button>

            <h2 className="heading-card mb-6">Confirmar reserva</h2>

            <div className="card-elevated mb-6">
              <h3 className="font-medium">{selectedBono ? selectedBono.name : selectedService.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className="text-muted-foreground text-sm">
                {selectedTime.start} - {selectedTime.end}
              </p>
              {useExistingBono ? (
                <p className="mt-3 text-sm font-medium text-foreground">
                  ✓ Se descontará 1 sesión de tu bono ({useExistingBono.sessions_remaining} restantes)
                </p>
              ) : (
                <p className="text-2xl font-heading font-semibold mt-3">
                  {(selectedBono ? selectedBono.price_cents : selectedService.price_cents) / 100}€
                </p>
              )}
            </div>

            {!useExistingBono && (
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-foreground">
                  <CreditCard size={20} />
                  <div className="text-left">
                    <p className="font-medium text-sm">Pago con tarjeta</p>
                    <p className="text-xs text-muted-foreground">Pago seguro con Stripe</p>
                  </div>
                </div>
              </div>
            )}

            <Button variant="cta" size="lg" className="w-full" onClick={handleConfirm} disabled={submitting}>
              {submitting
                ? "Procesando..."
                : useExistingBono
                  ? "Confirmar reserva"
                  : paymentMethod === "stripe"
                    ? "Pagar y reservar"
                    : "Reservar (pendiente de pago)"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
