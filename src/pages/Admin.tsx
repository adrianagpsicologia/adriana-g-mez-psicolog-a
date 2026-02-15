import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Plus, Trash2, Calendar, Users, Settings, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"bookings" | "availability" | "patients">("bookings");

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

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/portal");
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchBookings();
      fetchAvailability();
      fetchPatients();
    }
  }, [user, isAdmin]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, service:services(name)")
      .order("booking_date", { ascending: true });
    // Fetch profiles separately for names
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

  const updateBookingStatus = async (id: string, status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show") => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  const confirmPayment = async (id: string) => {
    await supabase.from("bookings").update({ payment_status: "paid", status: "confirmed" }).eq("id", id);
    toast({ title: "Pago confirmado" });
    fetchBookings();
  };

  if (loading || !user || !isAdmin) return null;

  const tabs = [
    { key: "bookings", label: "Citas", icon: Calendar },
    { key: "availability", label: "Disponibilidad", icon: Clock },
    { key: "patients", label: "Pacientes", icon: Users },
  ] as const;

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
          <div className="space-y-4">
            <h2 className="heading-card">Todas las citas</h2>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay citas.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{b.patient_name || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">
                        {b.service?.name} · {format(parseISO(b.booking_date), "d MMM yyyy", { locale: es })} · {b.start_time?.slice(0, 5)}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === "confirmed" ? "bg-green-100 text-green-800" :
                          b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          b.status === "completed" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {b.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {b.payment_method === "transfer" ? "Transferencia" : "Stripe"} · {b.payment_status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {b.payment_status === "pending" && b.payment_method === "transfer" && (
                        <Button size="sm" variant="cta" onClick={() => confirmPayment(b.id)}>
                          Confirmar pago
                        </Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "completed")}>
                          Marcar realizada
                        </Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <div className="space-y-4">
            <h2 className="heading-card">Pacientes</h2>
            {patients.map((p) => (
              <div key={p.id} className="card-elevated">
                <p className="font-medium">{p.full_name || "Sin nombre"}</p>
                <p className="text-sm text-muted-foreground">{p.phone}</p>
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
        )}
      </div>
    </div>
  );
};

export default Admin;
