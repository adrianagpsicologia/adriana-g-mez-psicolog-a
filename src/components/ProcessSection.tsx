import { MessageCircle, Cog, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Primera entrevista gratuita",
    description: "Acordamos la primera entrevista gratuita, donde vemos el motivo de consulta, posibles líneas de actuación y frecuencia con la que realizaremos las sesiones.",
  },
  {
    number: "02",
    icon: Cog,
    title: "Sesiones de trabajo",
    description: "Realizamos las sesiones donde tratamos los aspectos que acordamos (además de posibles temas que puedan ir surgiendo), realizamos cambios en aquellas conductas/maneras de pensar que puedan estar haciéndonos daño.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Evaluación y adaptación",
    description: "Evaluamos los cambios que vamos realizando y posibles dificultades/resistencias que podamos encontrar en el camino. Establecemos nuevas pautas en base a esto.",
  },
];

const ProcessSection = () => {
  return (
    <section id="proceso" className="section-padding bg-secondary/30">
      <div className="container-wide">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Paso a paso
          </p>
          <h2 className="heading-section">Cómo es el proceso</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            <div className="space-y-12 md:space-y-0">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative md:grid md:grid-cols-2 md:gap-12 ${
                    index % 2 === 0 ? "" : "md:direction-rtl"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`card-elevated mb-8 md:mb-16 ${
                      index % 2 === 0 ? "md:text-right" : "md:col-start-2"
                    }`}
                  >
                    <div className={`flex items-start gap-4 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center">
                        <step.icon size={20} />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground tracking-wider">
                          PASO {step.number}
                        </span>
                        <h3 className="heading-card mt-1 mb-3">{step.title}</h3>
                        <p className="body-base text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground border-4 border-background" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
