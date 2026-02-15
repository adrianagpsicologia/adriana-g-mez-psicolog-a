import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="card-elevated text-center max-w-md">
        <CheckCircle size={48} className="mx-auto text-foreground mb-4" />
        <h1 className="heading-card mb-2">¡Reserva confirmada!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Tu cita ha sido reservada correctamente. Recibirás un email de confirmación.
        </p>
        <Button variant="cta" asChild>
          <Link to="/portal">Ir a mi portal</Link>
        </Button>
      </div>
    </div>
  );
};

export default BookingSuccess;
