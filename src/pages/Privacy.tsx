import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { COOKIE_SETTINGS_EVENT } from "@/components/ConsentBanner";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-narrow py-12 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <h1 className="heading-section mb-8">Política de privacidad</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-medium text-foreground mb-3">
              Responsable del tratamiento
            </h2>
            <p>
              Adriana Gómez, psicóloga general sanitaria y neuropsicóloga
              clínica (Nº Colegiada: GZ02675). Contacto:{" "}
              <a
                href="mailto:adriana@adrianagomezpsicologia.com"
                className="underline underline-offset-2"
              >
                adriana@adrianagomezpsicologia.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-medium text-foreground mb-3">
              Reservas y datos de pacientes
            </h2>
            <p>
              Las citas se gestionan a través de Google Calendar y los pagos a
              través de Stripe. Los datos que facilites al reservar (nombre,
              correo electrónico y datos de la cita) se utilizan
              exclusivamente para gestionar tu reserva y prestarte el servicio
              solicitado. Estos datos nunca se envían a plataformas
              publicitarias.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-medium text-foreground mb-3">
              Medición de anuncios (Google Ads)
            </h2>
            <p>
              Esta web utiliza la etiqueta de medición de Google Ads
              (destinatario: Google) con una única finalidad: saber si los
              anuncios funcionan, midiendo visitas y reservas completadas de
              forma agregada. Para ello se pueden instalar cookies de
              medición y registrar un identificador seudónimo del anuncio en
              el que pulsaste.
            </p>
            <p className="mt-3">
              Nunca se envían a Google nombres, teléfonos, correos
              electrónicos, motivos de consulta ni ningún dato de pacientes.
            </p>
            <p className="mt-3">
              Si te encuentras en la Unión Europea, el Espacio Económico
              Europeo, el Reino Unido o Suiza, esta medición solo se activa si
              aceptas las cookies de medición en el aviso correspondiente.
              Puedes retirar o cambiar tu consentimiento en cualquier momento,
              con efecto inmediato, desde «Configurar cookies»:
            </p>
            <Button
              variant="ctaOutline"
              size="sm"
              className="mt-4"
              onClick={() =>
                window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
              }
            >
              Configurar cookies
            </Button>
            <p className="mt-4 text-sm">
              Más información sobre cómo Google trata estos datos:{" "}
              <a
                href="https://business.safety.google/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                business.safety.google/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-medium text-foreground mb-3">
              Tus derechos
            </h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, supresión,
              oposición, limitación y portabilidad escribiendo a{" "}
              <a
                href="mailto:adriana@adrianagomezpsicologia.com"
                className="underline underline-offset-2"
              >
                adriana@adrianagomezpsicologia.com
              </a>
              . También tienes derecho a reclamar ante la Agencia Española de
              Protección de Datos (aepd.es).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
