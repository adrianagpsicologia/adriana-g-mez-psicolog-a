import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Blog = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="section-padding">
        <div className="container-wide">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Recursos y reflexiones
            </p>
            <h1 className="heading-section">Blog</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <Link to={`/blog/${post.slug}`} key={index}>
                <article className="card-elevated group cursor-pointer h-full overflow-hidden">
                  <div className="aspect-[3/2] overflow-hidden -mx-6 -mt-6 mb-5">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium bg-accent px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="heading-card mb-3 group-hover:text-muted-foreground transition-colors">
                    {post.title}
                  </h3>
                  <p className="body-base text-muted-foreground">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm mt-4 group-hover:gap-2 transition-all">
                    Leer más <ArrowRight size={14} />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default Blog;
