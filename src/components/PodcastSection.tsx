import { Headphones, Instagram, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import podcastLogo from "@/assets/podcast-logo.svg.asset.json";

const PodcastSection = () => (
  <section id="podcast" className="podcast-section relative overflow-hidden scroll-mt-20">
    <div className="podcast-rings" aria-hidden="true" />
    <div className="container-wide relative py-16 md:py-20">
      <div className="podcast-logo-frame mx-auto mb-10 md:mb-12">
        <img
          src={podcastLogo.url}
          alt="¿Qué hago en esta vida? Podcast"
          className="h-full w-full rounded-full object-contain"
          loading="lazy"
          width={1254}
          height={1254}
        />
      </div>
      <div className="max-w-4xl">
        <p className="text-sm font-medium text-podcast-accent mb-5">
          DOS HERMANAS · UNA PSICÓLOGA · MIL DILEMAS
        </p>
        <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-5">
          Qué hago en <span className="text-podcast-accent">esta vida</span>
        </h2>
        <div className="space-y-5 text-lg md:text-xl leading-relaxed text-podcast-muted max-w-4xl">
          <p>
            Qué hago en esta vida es un podcast conversacional sobre la vida, la mente y lo que sentimos.
            Adriana Gómez, psicóloga clínica y sanitaria, y su hermana, la comunicóloga Marta Gómez,
            charlan de forma cercana -y sin filtro- sobre emociones, dilemas y esas preguntas que todos nos hacemos.
          </p>
          <p>
            Con un enfoque psicológico, pero en tono cercano y sin tecnicismos, Qué hago en esta vida
            es un espacio que invita a pensar, reír y sentirse acompañado.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-8">
          <Button variant="podcast" size="lg" asChild>
            <a href="https://open.spotify.com/show/7cjUgsH6tSzskS061w7rKh?si=5c76757dfae44d7b" target="_blank" rel="noopener noreferrer">
              <Headphones aria-hidden="true" /> Escuchar en Spotify
            </a>
          </Button>
          <Button variant="podcastOutline" size="lg" asChild>
            <a href="https://www.youtube.com/@Quehagoenestavida" target="_blank" rel="noopener noreferrer">
              <Play aria-hidden="true" /> Escuchar en YouTube
            </a>
          </Button>
          <Button variant="podcastOutline" size="lg" asChild>
            <a href="https://www.instagram.com/quehagoenestavida/" target="_blank" rel="noopener noreferrer">
              <Instagram aria-hidden="true" /> Instagram
            </a>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default PodcastSection;