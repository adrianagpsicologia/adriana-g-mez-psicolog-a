import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Plus, Trash2, Calendar, Users, Clock, Check, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"bookings" | "availability" | "patients" | "admin-booking">("bookings");

  // Bookings
  const [bookings, setBookings] = useState<any[]>([]);
  // Availability
  const [availability, setAvailability] = useState<any[]>([]);
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("14:00");
  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");
  // Patients
  const [patients, setPatients] = useState<any[]>([]);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [creatingPatient, setCreatingPatient] = useState(false);
  // Admin booking
  const [adminBookingPatient, setAdminBookingPatient] = useState<any>(null);
  const [adminBookingService, setAdminBookingService] = useState("");
  const [adminBookingDate, setAdminBookingDate] = useState("");
  const [adminBookingTime, setAdminBookingTime] = useState("");
  const [services, setServices] = useState<any[]>([]);
  // Modify modal
  const [modifyingBooking, setModifyingBooking] = useState<any>(null);
  const [modifyDate, setModifyDate] = useState("");
  const [modifyTime, setModifyTime] = useState("");
  // Processing state
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/portal");
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchBookings();
      fetchAvailability();
      fetchPatients();
      fetchServices();
    }
  }, [user, isAdmin]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, service:services(name)")
      .order("booking_date", { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map((b: any) => b.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
      setBookings(data.map((b: any) => ({ ...b, patient_name: profileMap.get(b.user_id) || "Sin nombre" })));
    }
  };

  const fetchAvailability = async () => {
    const [availRes, blockedRes] = await Promise.all([
      supabase.from("availability").select("*").order("day_of_week"),
      supabase.from("blocked_dates").select("*").order("blocked_date"),
    ]);
    if (availRes.data) setAvailability(availRes.data);
    if (blockedRes.data) setBlockedDates(blockedRes.data);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, patient_bonos:patient_bonos(*, bono:bonos(name))")
      .order("created_at", { ascending: false });
    if (data) setPatients(data);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").eq("is_active", true);
    if (data) setServices(data);
  };

  const handleCreatePatient = async () => {
    if (!newPatientName || !newPatientEmail) return;
    setCreatingPatient(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-patient", {
        body: { fullName: newPatientName, email: newPatientEmail },
      });
      if (error) throw error;
      toast({ title: "Paciente creado", description: `${newPatientName} añadido correctamente.` });
      setNewPatientName("");
      setNewPatientEmail("");
      fetchPatients();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleAdminBooking = async () => {
    if (!adminBookingPatient || !adminBookingService || !adminBookingDate || !adminBookingTime) return;
    setProcessing("admin-booking");
    try {
      const service = services.find((s: any) => s.id === adminBookingService);
      const duration = service?.duration_minutes || 50;
      const [h, m] = adminBookingTime.split(":").map(Number);
      const endMin = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00`;

      const { error } = await supabase.from("bookings").insert({
        user_id: adminBookingPatient.user_id,
        service_id: adminBookingService,
        booking_date: adminBookingDate,
        start_time: adminBookingTime + ":00",
        end_time: endTime,
        status: "pending",
        payment_method: "stripe",
        payment_status: "pending",
      });
      if (error) throw error;

      toast({ title: "Cita creada", description: "Cita asignada correctamente al paciente." });
      setAdminBookingPatient(null);
      setAdminBookingService("");
      setAdminBookingDate("");
      setAdminBookingTime("");
      fetchBookings();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  // Get patient email from auth (via edge function or stored) - we'll use user_id to look up
  const getPatientEmail = async (userId: string): Promise<string | null> => {
    // We can't access auth.users from client, so we'll pass user_id to the email function
    // and let it handle it. For now we'll store a note.
    // Actually, the edge function needs the email. Let's query it from the booking context.
    return null;
  };

  const handleVerify = async (booking: any) => {
    setProcessing(booking.id);
    try {
      // 1. Create Google Calendar event with Meet
      const { data: calData } = await supabase.functions.invoke("create-calendar-event", {
        body: {
          date: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          patientName: booking.patient_name,
          serviceName: booking.service?.name || "Sesión",
        },
      });

      const meetLink = calData?.meetLink || null;

      // 2. Update booking status
      await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);

      // 3. Get patient email via service role function
      const dateFormatted = format(parseISO(booking.booking_date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      const timeFormatted = `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`;

      // Send confirmation email to patient
      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "patient_confirmed",
          userId: booking.user_id,
          patientName: booking.patient_name,
          serviceName: booking.service?.name || "Sesión",
          date: dateFormatted,
          time: timeFormatted,
          meetLink,
        },
      });

      toast({ title: "Cita verificada", description: meetLink ? "Evento creado en Google Calendar con Google Meet." : "Evento creado en Google Calendar." });
      fetchBookings();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (booking: any) => {
    setProcessing(booking.id);
    try {
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);

      const dateFormatted = format(parseISO(booking.booking_date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      const timeFormatted = `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`;

      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "patient_cancelled",
          userId: booking.user_id,
          patientName: booking.patient_name,
          serviceName: booking.service?.name || "Sesión",
          date: dateFormatted,
          time: timeFormatted,
        },
      });

      toast({ title: "Cita cancelada", description: "Se ha notificado al paciente." });
      fetchBookings();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const openModify = (booking: any) => {
    setModifyingBooking(booking);
    setModifyDate(booking.booking_date);
    setModifyTime(booking.start_time.slice(0, 5));
  };

  const handleModify = async () => {
    if (!modifyingBooking || !modifyDate || !modifyTime) return;
    setProcessing(modifyingBooking.id);
    try {
      const duration = 50; // minutes
      const [h, m] = modifyTime.split(":").map(Number);
      const endMin = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00`;

      // Update booking
      await supabase.from("bookings").update({
        booking_date: modifyDate,
        start_time: modifyTime + ":00",
        end_time: endTime,
        status: "confirmed",
      }).eq("id", modifyingBooking.id);

      // Create new calendar event with Meet
      const { data: calData } = await supabase.functions.invoke("create-calendar-event", {
        body: {
          date: modifyDate,
          startTime: modifyTime + ":00",
          endTime,
          patientName: modifyingBooking.patient_name,
          serviceName: modifyingBooking.service?.name || "Sesión",
        },
      });

      const meetLink = calData?.meetLink || null;

      const oldDateFormatted = format(parseISO(modifyingBooking.booking_date), "EEEE d 'de' MMMM", { locale: es });
      const oldTimeFormatted = modifyingBooking.start_time.slice(0, 5);
      const newDateFormatted = format(parseISO(modifyDate), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      const newTimeFormatted = `${modifyTime} - ${endTime.slice(0, 5)}`;

      await supabase.functions.invoke("send-booking-email", {
        body: {
          type: "patient_modified",
          userId: modifyingBooking.user_id,
          patientName: modifyingBooking.patient_name,
          serviceName: modifyingBooking.service?.name || "Sesión",
          date: oldDateFormatted + " · " + oldTimeFormatted,
          time: newTimeFormatted,
          newDate: newDateFormatted,
          newTime: newTimeFormatted,
          meetLink,
          modifiedInfo: `Anteriormente: ${oldDateFormatted} a las ${oldTimeFormatted}`,
        },
      });

      toast({ title: "Cita modificada", description: "Se ha notificado al paciente con los nuevos detalles." });
      setModifyingBooking(null);
      fetchBookings();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  // --- Availability & blocked dates ---
  const addAvailability = async () => {
    const { error } = await supabase.from("availability").insert({
      day_of_week: newDay,
      start_time: newStart + ":00",
      end_time: newEnd + ":00",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Horario añadido" });
      fetchAvailability();
    }
  };

  const removeAvailability = async (id: string) => {
    await supabase.from("availability").delete().eq("id", id);
    fetchAvailability();
  };

  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    const { error } = await supabase.from("blocked_dates").insert({
      blocked_date: newBlockedDate,
      reason: newBlockedReason,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setNewBlockedDate("");
      setNewBlockedReason("");
      fetchAvailability();
    }
  };

  const removeBlockedDate = async (id: string) => {
    await supabase.from("blocked_dates").delete().eq("id", id);
    fetchAvailability();
  };

  const confirmPayment = async (id: string) => {
    await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", id);
    toast({ title: "Pago confirmado" });
    fetchBookings();
  };

  if (loading || !user || !isAdmin) return null;

  const statusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      confirmed: { label: "Confirmada", color: "bg-green-100 text-green-800" },
      pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Realizada", color: "bg-blue-100 text-blue-800" },
      cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
      no_show: { label: "No asistió", color: "bg-gray-100 text-gray-800" },
    };
    return map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const otherBookings = bookings.filter((b) => b.status !== "pending");

  const tabs = [
    { key: "bookings" as const, label: "Citas", icon: Calendar },
    { key: "availability" as const, label: "Disponibilidad", icon: Clock },
    { key: "patients" as const, label: "Pacientes", icon: Users },
    { key: "admin-booking" as const, label: "Asignar cita", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/portal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">Mi portal</span>
          </Link>
          <h1 className="font-heading text-xl font-medium">Panel Admin</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container-wide flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="space-y-8">
            {/* Pending requests - highlighted */}
            {pendingBookings.length > 0 && (
              <div>
                <h2 className="heading-card mb-4 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
                  Solicitudes pendientes ({pendingBookings.length})
                </h2>
                <div className="space-y-3">
                  {pendingBookings.map((b) => (
                    <div key={b.id} className="card-elevated border-2 border-yellow-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{b.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.service?.name} · {format(parseISO(b.booking_date), "EEEE d MMM yyyy", { locale: es })} · {b.start_time?.slice(0, 5)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel(b.status).color}`}>
                            {statusLabel(b.status).label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            b.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {b.payment_method === "transfer" ? "Transferencia" : "Stripe"} · {b.payment_status === "paid" ? "Pagado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {b.payment_status === "pending" && b.payment_method === "transfer" && (
                          <Button size="sm" variant="outline" onClick={() => confirmPayment(b.id)}>
                            💰 Confirmar pago
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="cta"
                          onClick={() => handleVerify(b)}
                          disabled={processing === b.id}
                        >
                          <Check size={14} />
                          {processing === b.id ? "Procesando..." : "Verificar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModify(b)}
                          disabled={processing === b.id}
                        >
                          <Pencil size={14} />
                          Modificar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(b)}
                          disabled={processing === b.id}
                        >
                          <X size={14} />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All bookings */}
            <div>
              <h2 className="heading-card mb-4">Todas las citas</h2>
              {otherBookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay citas.</p>
              ) : (
                <div className="space-y-3">
                  {otherBookings.map((b) => (
                    <div key={b.id} className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{b.patient_name || "Sin nombre"}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.service?.name} · {format(parseISO(b.booking_date), "d MMM yyyy", { locale: es })} · {b.start_time?.slice(0, 5)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel(b.status).color}`}>
                            {statusLabel(b.status).label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            b.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {b.payment_method === "transfer" ? "Transferencia" : "Stripe"} · {b.payment_status === "paid" ? "Pagado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {b.status === "confirmed" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openModify(b)}>
                              <Pencil size={14} /> Modificar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancel(b)}>
                              <X size={14} /> Cancelar
                            </Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              await supabase.from("bookings").update({ status: "completed" }).eq("id", b.id);
                              fetchBookings();
                            }}>
                              Marcar realizada
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modify modal */}
        {modifyingBooking && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="heading-card mb-4">Modificar cita</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {modifyingBooking.patient_name} — {modifyingBooking.service?.name}
              </p>
              <div className="space-y-4">
                <div>
                  <Label>Nueva fecha</Label>
                  <Input type="date" value={modifyDate} onChange={(e) => setModifyDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Nueva hora</Label>
                  <Input type="time" value={modifyTime} onChange={(e) => setModifyTime(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button variant="cta" onClick={handleModify} disabled={processing === modifyingBooking.id}>
                    {processing === modifyingBooking.id ? "Procesando..." : "Guardar cambios"}
                  </Button>
                  <Button variant="outline" onClick={() => setModifyingBooking(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability tab */}
        {tab === "availability" && (
          <div className="space-y-8">
            <div>
              <h2 className="heading-card mb-4">Horarios semanales</h2>
              <div className="flex flex-wrap gap-3 items-end mb-4">
                <div>
                  <Label>Día</Label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="block w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {DAYS.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Desde</Label>
                  <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={addAvailability} variant="cta" size="sm">
                  <Plus size={14} /> Añadir
                </Button>
              </div>

              <div className="space-y-2">
                {availability.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-sm">
                      <strong>{DAYS[a.day_of_week]}</strong> · {a.start_time?.slice(0, 5)} - {a.end_time?.slice(0, 5)}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeAvailability(a.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                {availability.length === 0 && (
                  <p className="text-muted-foreground text-sm">No hay horarios configurados.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="heading-card mb-4">Fechas bloqueadas</h2>
              <div className="flex flex-wrap gap-3 items-end mb-4">
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Motivo (opcional)</Label>
                  <Input value={newBlockedReason} onChange={(e) => setNewBlockedReason(e.target.value)} className="mt-1" placeholder="Vacaciones" />
                </div>
                <Button onClick={addBlockedDate} variant="cta" size="sm">
                  <Plus size={14} /> Bloquear
                </Button>
              </div>
              <div className="space-y-2">
                {blockedDates.map((bd) => (
                  <div key={bd.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-sm">
                      {format(parseISO(bd.blocked_date), "d MMM yyyy", { locale: es })}
                      {bd.reason && ` — ${bd.reason}`}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeBlockedDate(bd.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patients tab */}
        {tab === "patients" && (
          <div className="space-y-8">
            {/* Add new patient */}
            <div>
              <h2 className="heading-card mb-4">Añadir paciente</h2>
              <div className="flex flex-wrap gap-3 items-end mb-6">
                <div>
                  <Label>Nombre y apellidos</Label>
                  <Input
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="mt-1 w-64"
                    placeholder="Nombre Apellido"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    className="mt-1 w-64"
                    placeholder="paciente@email.com"
                  />
                </div>
                <Button onClick={handleCreatePatient} variant="cta" size="sm" disabled={creatingPatient}>
                  <Plus size={14} /> {creatingPatient ? "Creando..." : "Añadir"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Puedes asignar el mismo email a diferentes pacientes si es necesario.
              </p>
            </div>

            {/* Patient list */}
            <div>
              <h2 className="heading-card mb-4">Pacientes registrados</h2>
              {patients.map((p) => (
                <div key={p.id} className="card-elevated mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.full_name || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">{p.phone}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdminBookingPatient(p);
                        setTab("admin-booking");
                      }}
                    >
                      <Calendar size={14} /> Asignar cita
                    </Button>
                  </div>
                  {(p.patient_bonos as any[])?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {(p.patient_bonos as any[]).map((pb: any) => (
                        <p key={pb.id} className="text-xs text-muted-foreground">
                          {pb.bono?.name}: {pb.sessions_remaining}/{pb.sessions_total} sesiones · {pb.payment_status}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {patients.length === 0 && <p className="text-muted-foreground text-sm">No hay pacientes registrados.</p>}
            </div>
          </div>
        )}

        {/* Admin booking tab */}
        {tab === "admin-booking" && (
          <div className="space-y-6 max-w-lg">
            <h2 className="heading-card">Asignar cita a paciente</h2>

            <div>
              <Label>Paciente</Label>
              {adminBookingPatient ? (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-medium">{adminBookingPatient.full_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setAdminBookingPatient(null)}>Cambiar</Button>
                </div>
              ) : (
                <div className="mt-1 space-y-2 max-h-48 overflow-y-auto">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAdminBookingPatient(p)}
                      className="w-full text-left p-3 rounded-lg bg-secondary hover:bg-accent text-sm transition-colors"
                    >
                      {p.full_name || "Sin nombre"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Servicio</Label>
              <select
                value={adminBookingService}
                onChange={(e) => setAdminBookingService(e.target.value)}
                className="block w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {services.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Input type="date" value={adminBookingDate} onChange={(e) => setAdminBookingDate(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Hora</Label>
              <Input type="time" value={adminBookingTime} onChange={(e) => setAdminBookingTime(e.target.value)} className="mt-1" />
            </div>

            <Button
              variant="cta"
              onClick={handleAdminBooking}
              disabled={!adminBookingPatient || !adminBookingService || !adminBookingDate || !adminBookingTime || processing === "admin-booking"}
            >
              {processing === "admin-booking" ? "Creando..." : "Crear cita"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
