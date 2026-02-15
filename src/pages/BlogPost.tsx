import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="container-wide section-padding text-center">
          <h1 className="heading-section mb-4">Artículo no encontrado</h1>
          <Link to="/#blog" className="text-primary underline">
            Volver al blog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <article className="section-padding">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to="/#blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Volver al blog
          </Link>

          <span className="text-xs font-medium bg-accent px-3 py-1 rounded-full">
            {post.category}
          </span>

          <h1 className="heading-section mt-4 mb-8">{post.title}</h1>

          <div className="space-y-6">
            {post.content.map((paragraph, index) => (
              <p key={index} className="body-base text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default BlogPost;
