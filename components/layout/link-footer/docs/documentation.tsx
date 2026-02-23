import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Documentation - MatJenin',
  description: 'Complete documentation for MatJenin platform.',
};

export default function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of MatJenin and set up your first project.',
      icon: '🚀',
      links: [
        { title: 'Quick Start Guide', href: '#' },
        { title: 'Installation', href: '#' },
        { title: 'Your First Query', href: '#' },
        { title: 'Basic Concepts', href: '#' }
      ]
    },
    {
      title: 'Core Concepts',
      description: 'Understand the fundamental concepts behind our platform.',
      icon: '📚',
      links: [
        { title: 'Vector Embeddings', href: '#' },
        { title: 'RAG Architecture', href: '#' },
        { title: 'Multi-Tenancy', href: '#' },
        { title: 'Data Security', href: '#' }
      ]
    },
    {
      title: 'API Reference',
      description: 'Detailed API documentation with examples.',
      icon: '🔌',
      links: [
        { title: 'REST API', href: '/link-footer/docs/api-reference' },
        { title: 'tRPC Procedures', href: '#' },
        { title: 'Authentication', href: '#' },
        { title: 'Rate Limits', href: '#' }
      ]
    },
    {
      title: 'SDKs & Tools',
      description: 'Official libraries and tools for easier integration.',
      icon: '🛠️',
      links: [
        { title: 'JavaScript SDK', href: '#' },
        { title: 'Python SDK', href: '#' },
        { title: 'CLI Tools', href: '#' },
        { title: 'Plugins', href: '#' }
      ]
    },
    {
      title: 'Integrations',
      description: 'Connect with your favorite tools and services.',
      icon: '🔗',
      links: [
        { title: 'OpenAI', href: '#' },
        { title: 'Anthropic', href: '#' },
        { title: 'Google AI', href: '#' },
        { title: 'Custom LLMs', href: '#' }
      ]
    },
    {
      title: 'Best Practices',
      description: 'Recommendations for production deployments.',
      icon: '✨',
      links: [
        { title: 'Performance Tuning', href: '#' },
        { title: 'Security Checklist', href: '#' },
        { title: 'Error Handling', href: '#' },
        { title: 'Monitoring', href: '#' }
      ]
    }
  ];

  const codeExample = `import { MatJenin } from '@matjenin/sdk';

const client = new MatJenin({
  apiKey: process.env.MATJENIN_API_KEY
});

// Upload a document
await client.documents.create({
  title: 'My Document',
  content: 'Your content here...'
});

// Query your documents
const response = await client.query.ask({
  message: 'What is this document about?'
});

console.log(response.answer);`;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Documentation</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build with MatJenin. From quick start guides to advanced tutorials.
            </p>
          </section>

          {/* Search */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full px-6 py-4 text-lg border rounded-xl bg-muted"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  Search
                </button>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="#" className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <span className="text-3xl block mb-3">🚀</span>
                <h3 className="font-semibold mb-1">Quick Start</h3>
                <p className="text-sm text-muted-foreground">Get started in 5 minutes</p>
              </Link>
              <Link href="/link-footer/docs/api-reference" className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <span className="text-3xl block mb-3">🔌</span>
                <h3 className="font-semibold mb-1">API Reference</h3>
                <p className="text-sm text-muted-foreground">Complete API docs</p>
              </Link>
              <Link href="#" className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <span className="text-3xl block mb-3">💬</span>
                <h3 className="font-semibold mb-1">Community</h3>
                <p className="text-sm text-muted-foreground">Get help from the community</p>
              </Link>
            </div>
          </section>

          {/* Code Example */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Simple Integration</h2>
                <p className="text-muted-foreground mb-4">
                  Our SDK makes it easy to get started. Just a few lines of code to upload 
                  documents and start querying.
                </p>
                <Link
                  href="/link-footer/docs/api-reference"
                  className="text-primary font-medium hover:underline"
                >
                  View Full API Docs →
                </Link>
              </div>
              <div className="p-6 bg-muted rounded-xl overflow-hidden">
                <pre className="text-sm overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Documentation Sections */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Browse by Topic</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <div key={index} className="p-6 border rounded-xl">
                  <span className="text-3xl mb-3 block">{section.icon}</span>
                  <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link href={link.href} className="text-sm text-primary hover:underline">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Additional Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                <p className="text-muted-foreground mb-4">
                  Watch step-by-step video tutorials on our YouTube channel.
                </p>
                <Link href="#" className="text-primary font-medium hover:underline">
                  Watch Videos →
                </Link>
              </div>
              <div className="p-6 border rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Example Projects</h3>
                <p className="text-muted-foreground mb-4">
                  Explore example projects and templates in our GitHub repository.
                </p>
                <Link href="https://github.com/MatMotoFix-Pro" className="text-primary font-medium hover:underline">
                  View Examples →
                </Link>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/link-footer/docs/support"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/link-footer/docs/community"
                  className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
                >
                  Ask Community
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

