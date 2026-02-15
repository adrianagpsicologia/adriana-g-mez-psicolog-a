import { Mail, Phone, MapPin } from "lucide-react";
import knotIcon from "@/assets/knot-icon.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-wide py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={knotIcon} alt="" className="w-8 h-8 object-contain invert opacity-70" />
              <span className="font-heading text-2xl font-medium">Adriana Gómez</span>
            </div>
            <p className="text-background/70 text-sm mb-4">
              Psicóloga general sanitaria y neuropsicóloga clínica. 
              Ayudándote a desenredar pensamientos y construir bienestar.
            </p>
            <p className="text-background/50 text-xs">
              Nº Colegiada: GZ02675
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg mb-4">Navegación</h4>
            <nav className="space-y-2">
              <a href="#servicios" className="block text-background/70 hover:text-background transition-colors text-sm">
                Servicios
              </a>
              <a href="#sobre-mi" className="block text-background/70 hover:text-background transition-colors text-sm">
                Sobre mí
              </a>
              <a href="#proceso" className="block text-background/70 hover:text-background transition-colors text-sm">
                Proceso
              </a>
              <a href="#tarifas" className="block text-background/70 hover:text-background transition-colors text-sm">
                Tarifas
              </a>
              <a href="#faq" className="block text-background/70 hover:text-background transition-colors text-sm">
                FAQ
              </a>
              <a href="#blog" className="block text-background/70 hover:text-background transition-colors text-sm">
                Blog
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg mb-4">Contacto</h4>
            <div className="space-y-3">
              <a
                href="mailto:adrianagpsicologia@gmail.com"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Mail size={16} />
                adrianagpsicologia@gmail.com
              </a>
              <a
                href="https://wa.me/34722491151"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Phone size={16} />
                +34 722 491 151
              </a>
              <div className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>Consulta online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-xs">
            © {new Date().getFullYear()} Adriana Gómez Psicología. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-background/50">
            <a href="#" className="hover:text-background transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Aviso legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
