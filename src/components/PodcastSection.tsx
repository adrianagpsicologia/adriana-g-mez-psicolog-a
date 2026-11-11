import { useEffect, useState } from "react";
import { ArrowUpRight, Headphones, Instagram, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// Real file in public/ so it also works on the GitHub Pages deployment,
// which cannot serve Lovable CDN asset URLs.
const PODCAST_LOGO_URL = "/podcast-logo.svg";

interface Episode {
  id: string;
  title: string;
  date: string;
}

// Fallback used until the live episode list arrives (or if it fails).
const FALLBACK_EPISODES: Episode[] = [
  { id: "mbGDOOlz5X4", title: "¿Eres hijo de un padre inmaduro?", date: "2026-11-10" },
  { id: "p2MKWeEjx1A", title: "Productivos, disciplinados y agotados", date: "2026-11-03" },
  { id: "195MaUq-N3o", title: "Celos y conversaciones incómodas", date: "2026-10-28" },
];

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const PodcastSection = () => {
  const [episodes, setEpisodes] = useState<Episode[]>(FALLBACK_EPISODES);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/podcast-episodes`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.episodes) && data.episodes.length > 0) {
          setEpisodes(data.episodes);
          setSelected(0);
        }
      })
      .catch(() => {
        // Keep the fallback list.
      });
  }, []);

  const current = episodes[selected] ?? episodes[0];

  return (
    <section
      id="podcast"
      className="podcast-section relative overflow-hidden scroll-mt-20"
    >
      <div className="podcast-rings" aria-hidden="true" />
      <div className="container-wide relative py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Presentation */}
          <div>
            <div className="podcast-logo-frame podcast-logo-frame--small mb-8">
              <img
                src={PODCAST_LOGO_URL}
                alt="¿Qué hago en esta vida? Podcast"
                className="h-full w-full rounded-full object-contain"
                width={1254}
                height={1254}
              />
            </div>
            <p className="text-sm font-medium text-podcast-accent mb-5">
              DOS HERMANAS · UNA PSICÓLOGA · MIL DILEMAS
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-5">
              Qué hago en <span className="text-podcast-accent">esta vida</span>
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-podcast-muted">
              <p>
                Qué hago en esta vida es un podcast conversacional sobre la
                vida, la mente y lo que sentimos. Adriana Gómez, psicóloga
                clínica y sanitaria, y su hermana, la comunicóloga Marta
                Gómez, charlan de forma cercana -y sin filtro- sobre
                emociones, dilemas y esas preguntas que todos nos hacemos.
              </p>
              <p>
                Con un enfoque psicológico, pero en tono cercano y sin
                tecnicismos, Qué hago en esta vida es un espacio que invita a
                pensar, reír y sentirse acompañado.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-8">
              <Button variant="podcast" size="lg" asChild>
                <a
                  href="https://open.spotify.com/show/7cjUgsH6tSzskS061w7rKh?si=5c76757dfae44d7b"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Headphones aria-hidden="true" /> Escuchar en Spotify
                </a>
              </Button>
              <Button variant="podcastOutline" size="lg" asChild>
                <a
                  href="https://www.youtube.com/@Quehagoenestavida"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play aria-hidden="true" /> Escuchar en YouTube
                </a>
              </Button>
              <Button variant="podcastOutline" size="lg" asChild>
                <a
                  href="https://www.instagram.com/quehagoenestavida/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram aria-hidden="true" /> Instagram
                </a>
              </Button>
            </div>
          </div>

          {/* Latest episodes */}
          <div className="podcast-card">
            <div className="aspect-video rounded-t-2xl overflow-hidden bg-podcast-foreground/5">
              <iframe
                key={current.id}
                src={`https://www.youtube-nocookie.com/embed/${current.id}`}
                title={`Episodio: ${current.title}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6 md:p-8">
              <p className="text-xs font-medium tracking-[0.2em] text-podcast-accent mb-2">
                EPISODIO {String(selected + 1).padStart(2, "0")}
              </p>
              <h3 className="font-heading text-2xl md:text-3xl font-medium mb-1">
                {current.title}
              </h3>
              <p className="text-sm text-podcast-muted mb-6">
                {formatDate(current.date)}
              </p>

              <div className="space-y-3">
                {episodes.map((episode, index) => (
                  <button
                    key={episode.id}
                    onClick={() => setSelected(index)}
                    className={`w-full flex items-center gap-4 text-left p-4 rounded-xl border transition-all duration-200 ${
                      index === selected
                        ? "border-podcast-accent bg-podcast-accent/10"
                        : "border-podcast-border/60 hover:border-podcast-accent/60 hover:bg-podcast-accent/5"
                    }`}
                  >
                    <span className="flex-grow min-w-0">
                      <span className="block font-medium truncate">
                        {episode.title}
                      </span>
                      <span className="block text-xs text-podcast-muted mt-0.5">
                        {formatDate(episode.date)}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-podcast-accent flex-shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>

              <a
                href={`https://www.youtube.com/watch?v=${current.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-podcast-muted hover:text-podcast-foreground transition-colors mt-6 underline underline-offset-4"
              >
                Abrir este episodio en YouTube
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
