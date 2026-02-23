import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Features - MatJenin',
  description: 'Explore the powerful features of MatJenin platform.',
};

export default function Features() {
  const features = [
    {
      title: 'Vector Database',
      description: 'Store and search high-dimensional embeddings with lightning-fast performance. Our optimized HNSW indexing ensures sub-millisecond query responses.',
      icon: '🗄️',
      details: [
        'HNSW indexing for fast search',
        'Support for 1536+ dimensions',
        'Real-time vector updates',
        'Automatic sharding'
      ]
    },
    {
      title: 'RAG Pipeline',
      description: 'Build powerful AI applications with Retrieval-Augmented Generation. Combine your data with LLMs for accurate, contextual responses.',
      icon: '🔄',
      details: [
        'Automatic document chunking',
        'Multi-source retrieval',
        'Citation generation',
        'Streaming responses'
      ]
    },
    {
      title: 'Multi-Provider AI',
      description: 'Use your preferred LLM provider. OpenAI, Anthropic, Google, and more - all supported with a unified API.',
      icon: '🤖',
      details: [
        'OpenAI GPT models',
        'Anthropic Claude',
        'Google Gemini',
        'Custom model support'
      ]
    },
    {
      title: 'Multi-Tenant Security',
      description: 'Enterprise-grade isolation ensures your data remains completely separate. Perfect for SaaS applications.',
      icon: '🔒',
      details: [
        'Data isolation at database level',
        'Role-based access control',
        'API key permissions',
        'Audit logging'
      ]
    },
    {
      title: 'Real-time Processing',
      description: 'Process documents and generate embeddings in real-time. See results as they happen.',
      icon: '⚡',
      details: [
        'Async document processing',
        'Progress webhooks',
        'Streaming status updates',
        'Batch processing'
      ]
    },
    {
      title: 'Hybrid Search',
      description: 'Combine semantic vector search with keyword matching for the best of both worlds.',
      icon: '🔍',
      details: [
        'Dense + sparse vectors',
        'BM25 keyword search',
        'Reranking',
        'Custom weighting'
      ]
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track usage, monitor performance, and gain insights with comprehensive analytics.',
      icon: '📊',
      details: [
        'Usage metrics',
        'Cost tracking',
        'Performance graphs',
        'Export reports'
      ]
    },
    {
      title: 'Developer Experience',
      description: 'Built for developers with TypeScript SDKs, comprehensive docs, and great tooling.',
      icon: '👨‍💻',
      details: [
        'TypeScript SDK',
        'Python SDK',
        'REST + tRPC APIs',
        'Interactive docs'
      ]
    }
  ];

  const stats = [
    { value: '50ms', label: 'Average Query Time' },
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '10B+', label: 'Vectors Indexed' },
    { value: '50K+', label: 'Active Developers' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for AI Apps</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build production-ready AI applications. From vector storage to RAG pipelines.
            </p>
          </section>

          {/* Stats */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <div className="text-3xl font-bold mb-2 text-primary">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-8 border rounded-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose MatJenin?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">MatJenin</th>
                    <th className="text-center py-4 px-4">Pinecone</th>
                    <th className="text-center py-4 px-4">Weaviate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">Multi-tenancy</td>
                    <td className="py-4 px-4 text-center text-green-500">✓ Native</td>
                    <td className="py-4 px-4 text-center">Limited</td>
                    <td className="py-4 px-4 text-center">Manual</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Hybrid Search</td>
                    <td className="py-4 px-4 text-center text-green-500">✓ Built-in</td>
                    <td className="py-4 px-4 text-center">Add-on</td>
                    <td className="py-4 px-4 text-center text-green-500">✓ Built-in</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">RAG Pipeline</td>
                    <td className="py-4 px-4 text-center text-green-500">✓ Native</td>
                    <td className="py-4 px-4 text-center">✗</td>
                    <td className="py-4 px-4 text-center">Partial</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">tRPC API</td>
                    <td className="py-4 px-4 text-center text-green-500">✓</td>
                    <td className="py-4 px-4 text-center">✗</td>
                    <td className="py-4 px-4 text-center">✗</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Free Tier</td>
                    <td className="py-4 px-4 text-center text-green-500">✓ Generous</td>
                    <td className="py-4 px-4 text-center">Limited</td>
                    <td className="py-4 px-4 text-center">Self-hosted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Integrations */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Integrations</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['OpenAI', 'Anthropic', 'Google AI', 'Next.js', 'LangChain', 'LlamaIndex', 'Python', 'TypeScript'].map((tech, index) => (
                <div key={index} className="px-6 py-3 border rounded-full">
                  {tech}
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Start building with MatJenin today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/link-footer/docs/pricing"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Pricing
                </Link>
                <Link
                  href="/link-footer/docs/documentation"
                  className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
                >
                  Read Docs
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

