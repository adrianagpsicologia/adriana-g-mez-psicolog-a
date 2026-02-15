import { Check, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pricingPlans = [
  {
    type: "individual",
    icon: User,
    title: "Sesión Individual",
    price: 60,
    unit: "sesión",
    features: [
      "Sesión de 50 minutos",
    ],
    popular: false,
  },
  {
    type: "individual-bono",
    icon: User,
    title: "Bono 4 Sesiones Individuales",
    price: 200,
    originalPrice: 240,
    pricePerSession: 50,
    unit: "bono",
    features: [
      "4 sesiones de 50 minutos",
      "Ahorro de 40€",
      "Sin fecha de caducidad",
    ],
    popular: true,
  },
  {
    type: "pareja",
    icon: Users,
    title: "Sesión de Pareja",
    price: 70,
    unit: "sesión",
    features: [
      "Sesión de 50 minutos",
    ],
    popular: false,
  },
  {
    type: "pareja-bono",
    icon: Users,
    title: "Bono 4 Sesiones de Pareja",
    price: 240,
    originalPrice: 280,
    pricePerSession: 60,
    unit: "bono",
    features: [
      "4 sesiones de 50 minutos",
      "Ahorro de 40€",
      "Sin fecha de caducidad",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="tarifas" className="section-padding">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Tarifas transparentes
          </p>
          <h2 className="heading-section mb-4">Reserva tu cita</h2>
          <p className="body-large text-muted-foreground max-w-2xl mx-auto">
            Primera entrevista para conocernos y ver cómo puedo ayudarte
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative card-elevated flex flex-col ${
                plan.popular ? "ring-2 ring-foreground" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                  Más popular
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <plan.icon size={18} className="text-foreground" />
                </div>
                <h3 className="font-heading text-lg font-medium">{plan.title}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-semibold">{plan.price}€</span>
                  <span className="text-muted-foreground text-sm">/{plan.unit}</span>
                </div>
                {plan.pricePerSession && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ({plan.pricePerSession}€/sesión)
                  </p>
                )}
                {plan.originalPrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    Antes: {plan.originalPrice}€
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="flex-shrink-0 mt-0.5 text-foreground" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "cta" : "ctaOutline"}
                className="w-full"
                asChild
              >
                <Link to="/auth">Reservar</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground body-base">
            ¿Tienes dudas? Contáctame directamente:
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="mailto:adriana@adrianagomezpsicologia.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm hover:bg-accent transition-colors"
            >
              adriana@adrianagomezpsicologia.com
            </a>
            <a
              href="https://wa.me/34722491151"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm hover:bg-accent transition-colors"
            >
              WhatsApp: +34 722 491 151
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
