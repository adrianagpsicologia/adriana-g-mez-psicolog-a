import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-knots.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Ilustración abstracta de nudos desenredándose"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-narrow text-center pt-20">
        <div className="animate-slide-up">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Psicología · Neuropsicología
          </p>
          
          <h1 className="heading-display mb-6">
            Desenredando pensamientos,<br />
            <span className="italic">construyendo bienestar</span>
          </h1>
          
          <p className="body-large text-muted-foreground max-w-2xl mx-auto mb-10">
            Bienvenidx a mi consulta. Soy Adriana Gómez, psicóloga general sanitaria 
            y neuropsicóloga clínica. Mi objetivo es ayudarte a entender tus pensamientos 
            y emociones para generar cambios positivos en tu vida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cta" size="xl" asChild>
              <a href="https://calendar.app.google/BExC7nxrzS8QfKTC9" target="_blank" rel="noopener noreferrer">Reservar cita</a>
            </Button>
            <Button variant="ctaOutline" size="xl" asChild>
              <a href="#servicios">Conocer más</a>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
