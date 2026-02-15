import { Brain, Heart, Users, Sparkles, GraduationCap, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

const situations = [
  "Si notas un mayor nivel de estrés o ansiedad",
  "Si crees que tus pensamientos te están jugando una mala pasada y hacen que veas las cosas de una manera más negativa de lo que realmente son",
  "Quieres mejorar el concepto que tienes de ti mismx",
  "No sabes identificar qué es lo que te está generando malestar",
  "Quieres mejorar tu relación de pareja",
  "Si consideras que no tienes una buena relación con la comida y/o con tu cuerpo",
];

const mainServices = [
  {
    icon: Heart,
    title: "Inseguridad y autoestima",
    description: "Trabajamos juntos para fortalecer la imagen que tienes de ti mismx y desarrollar una relación más saludable contigo.",
  },
  {
    icon: Brain,
    title: "Ansiedad",
    description: "Entendemos el origen de tu ansiedad y construimos herramientas para gestionarla de manera efectiva.",
  },
  {
    icon: Sparkles,
    title: "Relación con la comida",
    description: "Abordamos la relación que tienes con la alimentación y tu cuerpo desde un enfoque respetuoso y comprensivo.",
  },
  {
    icon: Users,
    title: "Terapia de pareja",
    description: "Mejoramos la comunicación y resolvemos conflictos para construir una relación más sana y satisfactoria.",
  },
];

const otherServices = [
  { icon: Brain, label: "Depresión" },
  { icon: Heart, label: "Duelo" },
  { icon: Plane, label: "Fobias" },
  { icon: Sparkles, label: "Adicciones" },
  { icon: GraduationCap, label: "Dificultades académicas/laborales" },
];

const ServicesSection = () => {
  return (
    <section id="servicios" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            ¿Cómo puedo ayudarte?
          </p>
          <h2 className="heading-section mb-6">Situaciones que podemos tratar</h2>
        </div>

        {/* Situations List */}
        <div className="max-w-3xl mx-auto mb-16">
          <ul className="space-y-4">
            {situations.map((situation, index) => (
              <li
                key={index}
                className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-soft"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="body-base text-foreground pt-1">{situation}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {mainServices.map((service, index) => (
            <div
              key={index}
              className="card-elevated group"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <service.icon size={24} className="text-foreground" />
              </div>
              <h3 className="heading-card mb-3">{service.title}</h3>
              <p className="body-base text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Other Services */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">También trabajo con:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {otherServices.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full text-sm font-medium shadow-soft"
              >
                <service.icon size={16} className="text-muted-foreground" />
                {service.label}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="cta" size="lg" asChild>
            <a href="#tarifas">Reservar primera sesión</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
