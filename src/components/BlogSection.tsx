import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    title: "Cómo identificar los pensamientos automáticos negativos",
    excerpt: "Aprende a reconocer esos pensamientos que aparecen sin que te des cuenta y que pueden afectar tu bienestar.",
    date: "Próximamente",
    category: "Ansiedad",
  },
  {
    title: "La importancia de la autocompasión en el proceso terapéutico",
    excerpt: "Descubre cómo tratarte con amabilidad puede ser el primer paso hacia el cambio.",
    date: "Próximamente",
    category: "Autoestima",
  },
  {
    title: "Comunicación asertiva en pareja: claves para conectar mejor",
    excerpt: "Herramientas prácticas para mejorar la comunicación y resolver conflictos de manera constructiva.",
    date: "Próximamente",
    category: "Pareja",
  },
];

const BlogSection = () => {
  return (
    <section id="blog" className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Recursos y reflexiones
            </p>
            <h2 className="heading-section">Blog</h2>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 group" disabled>
            Ver todos los artículos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="card-elevated group cursor-pointer opacity-75"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-accent px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {post.date}
                </span>
              </div>
              <h3 className="heading-card mb-3 group-hover:text-muted-foreground transition-colors">
                {post.title}
              </h3>
              <p className="body-base text-muted-foreground">{post.excerpt}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground italic">
            Próximamente nuevos artículos sobre psicología y bienestar emocional
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
