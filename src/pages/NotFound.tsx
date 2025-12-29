import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl md:text-8xl font-medium mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! Página no encontrada
        </p>
        <Button variant="cta" asChild>
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
