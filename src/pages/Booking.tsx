import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

const GOOGLE_APPOINTMENT_URL =
  "https://calendar.google.com/appointments/schedules/AcZssZ1oRc5an7dWe_z6YqzjzF7Y-iZwLPMYsrnIWayqxbPsSMFC19N31o7S_Iy368H8DiTZnYiuQ_50";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Volver</span>
          </Link>
          <h1 className="font-heading text-xl font-medium">Reservar cita</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="container-narrow py-8 flex-1 flex flex-col">
        {/* 24h policy */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-border mb-8">
          <AlertCircle size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Recuerda: las citas pueden modificarse hasta{" "}
            <strong className="text-foreground">24h antes</strong>. Pasado ese
            tiempo, la sesión se marcará como realizada.
          </p>
        </div>

        {/* Google Calendar Appointment iframe */}
        <div className="flex-1 min-h-[600px] rounded-xl overflow-hidden border border-border bg-card">
          <iframe
            src={GOOGLE_APPOINTMENT_URL}
            title="Reservar cita"
            className="w-full h-full min-h-[600px]"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;
