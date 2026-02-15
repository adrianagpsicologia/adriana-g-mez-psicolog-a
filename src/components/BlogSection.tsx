import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    title: "Celos",
    excerpt: "Los celos principalmente los genera la inseguridad, el sentirnos menos que la otra persona. Mirar hacia dentro es clave para entenderlos.",
    category: "Pareja",
  },
  {
    title: "Tus pensamientos no son hechos",
    excerpt: "Los pensamientos son una interpretación de los hechos, no el hecho como tal. Ante un mismo hecho, podemos tener diferentes pensamientos.",
    category: "Autoconocimiento",
  },
  {
    title: "El tiempo todo lo cura, ¿seguro?",
    excerpt: "El tiempo no cura, el tiempo no nos hace entender. La introspección y el trabajo a nivel anímico, en cambio, sí lo hacen.",
    category: "Bienestar",
  },
  {
    title: "Positividad, ¿puede llegar a ser dañina?",
    excerpt: "La positividad es buena hasta que empieza a generarnos un conflicto interno. Permitirnos estar mal es completamente válido.",
    category: "Emociones",
  },
  {
    title: "Nuestros actos y cómo nos vemos",
    excerpt: "Si nuestra conducta está enfocada en complacer a los demás, nuestra cabeza concluirá que nuestras opiniones no son válidas.",
    category: "Autoestima",
  },
  {
    title: "Acuerdos en pareja",
    excerpt: "No basta con establecer el respeto como obligación, sino acordar los pequeños actos que consideramos que lo implican.",
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
              className="card-elevated group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium bg-accent px-3 py-1 rounded-full">
                  {post.category}
                </span>
                
              </div>
              <h3 className="heading-card mb-3 group-hover:text-muted-foreground transition-colors">
                {post.title}
              </h3>
              <p className="body-base text-muted-foreground">{post.excerpt}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
