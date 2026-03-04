import { useEffect } from "react";

const GOOGLE_CALENDAR_LINK = "https://calendar.app.google/BExC7nxrzS8QfKTC9";

const Booking = () => {
  useEffect(() => {
    window.location.href = GOOGLE_CALENDAR_LINK;
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirigiendo al calendario de reservas...</p>
    </div>
  );
};

export default Booking;
