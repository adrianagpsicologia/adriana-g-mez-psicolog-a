import { Button } from "@/components/ui/button";
import adrianaPortrait from "@/assets/adriana-portrait.jpg";
import knotIcon from "@/assets/knot-icon.png";

const AboutSection = () => {
  return (
    <section id="sobre-mi" className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated w-72 md:w-96">
              <img
                src={adrianaPortrait}
                alt="Adriana Gómez - Psicóloga"
                className="w-full aspect-[3/4] object-cover object-[50%_25%]"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-accent rounded-full -z-10" />
            <div className="absolute -top-3 -left-3 w-12 h-12 opacity-30">
              <img src={knotIcon} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Sobre mí
            </p>
            <h2 className="heading-section mb-6">
              Hola, soy Adriana Gómez
            </h2>
            <p className="text-lg font-medium text-foreground mb-6">
              Soy psicóloga general sanitaria y neuropsicóloga clínica
            </p>
            <div className="space-y-4 text-muted-foreground body-base mb-8">
              <p>
                He comprobado que aprender a conocerse y aceptarse a uno mismo es uno de los 
                aspectos más importantes de un proceso terapéutico. Por ello, en mi consulta, 
                intento ahondar en el motivo de malestar para que cada persona pueda entender 
                qué lo genera y podamos construir las herramientas que permitan afrontarlo.
              </p>
              <p>
                En el apartado mi enfoque te explico un poco más en detalle cómo suelo 
                trabajar en terapia.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Número de colegiada: <span className="font-medium text-foreground">GZ02675</span>
            </p>
            <Button variant="ctaOutline" size="lg" asChild>
              <a href="#enfoque">Conocer mi enfoque</a>
            </Button>
          </div>
        </div>

        {/* Approach Section */}
        <div id="enfoque" className="mt-24 pt-12 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="heading-section mb-8">Mi enfoque en terapia</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-elevated text-center">
                <div className="w-20 h-20 mx-auto mb-4 opacity-70 p-2">
                  <img src={knotIcon} alt="" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-heading text-xl mb-2">Desenredar ideas</h4>
                <p className="text-sm text-muted-foreground">
                  Trabajo para ayudarte a identificar y organizar los pensamientos que generan malestar.
                </p>
              </div>
              <div className="card-elevated text-center">
                <div className="w-20 h-20 mx-auto mb-4 opacity-70 p-2">
                  <img src={knotIcon} alt="" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-heading text-xl mb-2">Comunicación directa</h4>
                <p className="text-sm text-muted-foreground">
                  Sin tecnicismos, de forma cercana y abierta para que puedas entenderte mejor.
                </p>
              </div>
              <div className="card-elevated text-center">
                <div className="w-20 h-20 mx-auto mb-4 opacity-70 p-2">
                  <img src={knotIcon} alt="" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-heading text-xl mb-2">Enfoque personalizado</h4>
                <p className="text-sm text-muted-foreground">
                  Cada persona es única, y así trabajamos: adaptándonos a tus necesidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
