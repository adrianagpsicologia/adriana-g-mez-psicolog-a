import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, LogOut, ArrowLeft, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isAfter, subHours } from "date-fns";
import { es } from "date-fns/locale";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_method: string;
  service: { name: string };
}

interface PatientBono {
  id: string;
  sessions_remaining: number;
  sessions_total: number;
  payment_status: string;
  bono: { name: string; service: { name: string } };
}

const Portal = () => {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bonos, setBonos] = useState<PatientBono[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    const [bookingsRes, bonosRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, service:services(name)")
        .eq("user_id", user!.id)
        .order("booking_date", { ascending: true }),
      supabase
        .from("patient_bonos")
        .select("*, bono:bonos(name, service:services(name))")
        .eq("user_id", user!.id)
        .eq("payment_status", "paid"),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as any);
    if (bonosRes.data) setBonos(bonosRes.data as any);
    setLoadingData(false);
  };

  const canCancel = (bookingDate: string, startTime: string) => {
    const dateTime = new Date(`${bookingDate}T${startTime}`);
    return isAfter(subHours(dateTime, 24), new Date());
  };

  const handleCancel = async (booking: Booking) => {
    if (!canCancel(booking.booking_date, booking.start_time)) {
      toast({
        title: "No es posible cancelar",
        description: "No se pueden cancelar citas con menos de 24 horas de antelación. La sesión se marcará como realizada.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cita cancelada", description: "Tu cita ha sido cancelada correctamente." });
      fetchData();
    }
  };

  const handleModify = (booking: Booking) => {
    if (!canCancel(booking.booking_date, booking.start_time)) {
      toast({
        title: "No es posible modificar",
        description: "No se pueden modificar citas con menos de 24 horas de antelación.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to booking page with modification context
    navigate(`/reservar?modificar=${booking.id}`);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(`${b.booking_date}T${b.start_time}`) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "confirmed" || new Date(`${b.booking_date}T${b.start_time}`) < new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">Volver</span>
          </Link>
          <h1 className="font-heading text-xl font-medium">Mi Portal</h1>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">Panel Admin</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container-wide py-8 space-y-8">
        {/* 24h policy banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-border">
          <AlertCircle size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Las sesiones pueden modificarse o cancelarse hasta <strong className="text-foreground">24 horas antes</strong> de la cita. 
            Pasado ese tiempo, la sesión se marcará automáticamente como realizada aunque no se asista.
          </p>
        </div>

        {/* Active bonos */}
        {bonos.length > 0 && (
          <section>
            <h2 className="heading-card mb-4 flex items-center gap-2">
              <Package size={20} />
              Mis Bonos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {bonos.map((bono) => (
                <div key={bono.id} className="card-elevated">
                  <h3 className="font-medium mb-2">{bono.bono.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full transition-all"
                          style={{ width: `${(bono.sessions_remaining / bono.sessions_total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {bono.sessions_remaining}/{bono.sessions_total} sesiones
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Book new session */}
        <div className="flex gap-3">
          <Button variant="cta" asChild>
            <Link to="/reservar">
              <Calendar size={16} />
              Reservar nueva cita
            </Link>
          </Button>
        </div>

        {/* Upcoming bookings */}
        <section>
          <h2 className="heading-card mb-4 flex items-center gap-2">
            <Clock size={20} />
            Próximas citas
          </h2>
          {loadingData ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tienes citas próximas.</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="card-elevated flex items-center justify-between">
                  <div>
                    <p className="font-medium">{(booking as any).service?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(booking.booking_date), "EEEE d 'de' MMMM", { locale: es })} · {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                    </p>
                  </div>
                   <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusLabel(booking.status).color}`}>
                      {statusLabel(booking.status).label}
                    </span>
                    {canCancel(booking.booking_date, booking.start_time) ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModify(booking)}
                        >
                          Modificar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking)}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleModify(booking)}
                          className="opacity-50"
                        >
                          Modificar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking)}
                          className="opacity-50"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past bookings */}
        {pastBookings.length > 0 && (
          <section>
            <h2 className="heading-card mb-4">Historial</h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="card-elevated flex items-center justify-between opacity-70">
                  <div>
                    <p className="font-medium">{(booking as any).service?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(booking.booking_date), "d MMM yyyy", { locale: es })} · {booking.start_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusLabel(booking.status).color}`}>
                    {statusLabel(booking.status).label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Portal;
