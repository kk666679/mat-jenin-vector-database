import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Blog - MatJenin',
  description: 'Latest news, tutorials, and insights from MatJenin.',
};

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: 'Introducing MatJenin 2.0',
      excerpt: 'Major release brings hybrid search, improved embeddings, and enterprise features.',
      date: 'January 15, ',
      category: 'Product',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Building RAG Applications with MatJenin',
      excerpt: 'A comprehensive guide to building production-ready RAG applications.',
      date: 'January 10, 2024',
      category: 'Tutorial',
      readTime: '12 min read'
    },
    {
      id: 3,
      title: 'Understanding Vector Embeddings',
      excerpt: 'Deep dive into how vector embeddings work and their role in semantic search.',
      date: 'January 5, 2024',
      category: 'Education',
      readTime: '8 min read'
    },
    {
      id: 4,
      title: 'Enterprise Security Best Practices',
      excerpt: 'How to secure your AI applications with our multi-tenant architecture.',
      date: 'December 28, 2023',
      category: 'Security',
      readTime: '6 min read'
    },
    {
      id: 5,
      title: 'Performance Optimization for Vector Search',
      excerpt: 'Tips and tricks to get the most out of your vector database.',
      date: 'December 20, 2023',
      category: 'Performance',
      readTime: '10 min read'
    },
    {
      id: 6,
      title: 'Multi-Tenant Architecture Explained',
      excerpt: 'Understanding how we achieve data isolation in our platform.',
      date: 'December 15, 2023',
      category: 'Architecture',
      readTime: '7 min read'
    }
  ];

  const categories = ['All', 'Product', 'Tutorial', 'Education', 'Security', 'Performance', 'Architecture'];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">MatJenin Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay up to date with the latest news, tutorials, and insights from the MatJenin team.
            </p>
          </section>

          {/* Categories */}
          <section className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {/* Featured Post */}
          <section className="mb-16">
            <div className="p-8 border rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Featured
                </span>
                <span className="text-sm text-muted-foreground">January 15, 2026</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Introducing MatJenin 2.0</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We&apos;re excited to announce the release of MatJenin 2.0 — our biggest update yet. 
                This release brings hybrid search capabilities, improved embedding models, and enterprise-grade features.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="text-sm text-muted-foreground">🚀 New Features</span>
                <span className="text-sm text-muted-foreground">⚡ Performance</span>
                <span className="text-sm text-muted-foreground">🔒 Security</span>
              </div>
            </div>
          </section>

          {/* Blog Grid */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{post.date}</span>
                      <button className="text-primary font-medium hover:underline">
                        Read more →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section className="mb-16">
            <div className="p-8 bg-muted rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4">Subscribe to our newsletter</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get the latest articles, tutorials, and product updates delivered directly to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border bg-background"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.slice(1).map((category) => (
                <Link
                  key={category}
                  href="#"
                  className="p-6 border rounded-lg hover:bg-muted/50 transition-colors text-center"
                >
                  <span className="font-medium">{category}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

