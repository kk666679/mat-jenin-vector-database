import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Changelog - MatJenin',
  description: 'Recent updates and improvements to MatJenin platform.',
};

export default function Changelog() {
  const changes = [
    {
      version: '2.1.0',
      date: 'January 15, 2026',
      type: 'major',
      title: 'Hybrid Search & Improved Embeddings',
      changes: {
        added: [
          'Hybrid search combining dense and sparse vectors',
          'New embedding model: paraphrase-multilingual-MiniLM-L12-v2',
          'Support for custom embedding models',
          'Batch document processing API',
          'Webhooks for document processing events'
        ],
        improved: [
          '50% faster query response times',
          'Better handling of large documents',
          'Improved chunk boundary detection',
          'Enhanced search relevance ranking'
        ],
        fixed: [
          'Memory leak in streaming responses',
          'Race condition in document deletion',
          'Incorrect chunk count display'
        ]
      }
    },
    {
      version: '2.0.0',
      date: 'December 1, 2025',
      type: 'major',
      title: 'MatJenin 2.0 - Major Release',
      changes: {
        added: [
          'Complete redesign of the dashboard',
          'Multi-tenant architecture with full isolation',
          'Role-based access control (RBAC)',
          'API key management with permissions',
          'Usage analytics and reporting',
          'Custom chunk size and overlap settings',
          'Support for multiple LLM providers'
        ],
        improved: [
          '10x faster vector search performance',
          'New modern UI with dark mode support',
          'Better error messages and debugging',
          'Improved documentation and examples'
        ],
        fixed: [
          'Session expiration issues',
          'Rate limiting bugs',
          'Document upload failures for large files'
        ]
      }
    },
    {
      version: '1.5.0',
      date: 'October 15, 2025',
      type: 'minor',
      title: 'Streaming & Real-time Features',
      changes: {
        added: [
          'Server-Sent Events (SSE) for streaming responses',
          'Real-time document processing status',
          'WebSocket support for chat applications',
          'Citation highlighting in responses'
        ],
        improved: [
          'Faster initial token delivery',
          'Better progress indicators',
          'Enhanced source attribution'
        ],
        fixed: [
          'Stream timeout issues',
          'Memory usage in long conversations'
        ]
      }
    },
    {
      version: '1.4.0',
      date: 'September 1, 2025',
      type: 'minor',
      title: 'Enhanced Security',
      changes: {
        added: [
          'Two-factor authentication (2FA)',
          'Audit logging for all operations',
          'IP allowlist for API keys',
          'Data encryption at rest'
        ],
        improved: [
          'Password requirements',
          'Session management',
          'API key rotation workflow'
        ],
        fixed: [
          'Security vulnerability in token refresh',
          'CORS configuration issues'
        ]
      }
    },
    {
      version: '1.3.0',
      date: 'July 15, 2025',
      type: 'minor',
      title: 'Developer Experience',
      changes: {
        added: [
          'TypeScript SDK with full type definitions',
          'Python SDK release',
          'Interactive API playground',
          'Code examples for all endpoints'
        ],
        improved: [
          'Error handling and messages',
          'Response time optimization',
          'Documentation navigation'
        ],
        fixed: [
          'SDK authentication bugs',
          'Documentation build errors'
        ]
      }
    },
    {
      version: '1.2.0',
      date: 'May 1, 2025',
      type: 'minor',
      title: 'Search Enhancements',
      changes: {
        added: [
          'Hybrid search support',
          'Metadata filtering',
          'Reranking capabilities',
          'Similar document discovery'
        ],
        improved: [
          'Search relevance algorithm',
          'Query parsing',
          'Result ranking'
        ],
        fixed: [
          'Edge cases in special character handling',
          'Empty result handling'
        ]
      }
    },
    {
      version: '1.1.0',
      date: 'March 1, 2025',
      type: 'minor',
      title: 'Beta Release',
      changes: {
        added: [
          'Document upload and processing',
          'Basic vector search',
          'Simple query interface',
          'Dashboard for document management'
        ],
        improved: [
          'Initial embedding generation',
          'Chunking algorithm'
        ],
        fixed: [
          'Various stability issues'
        ]
      }
    },
    {
      version: '1.0.0',
      date: 'January 1, 2026',
      type: 'major',
      title: 'Initial Launch',
      changes: {
        added: [
          'First release of MatJenin',
          'Core vector database functionality',
          'Basic document processing',
          'REST API'
        ],
        improved: [],
        fixed: []
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Changelog</h1>
            <p className="text-xl text-muted-foreground">
              Stay up to date with the latest features, improvements, and bug fixes.
            </p>
          </section>

          {/* Subscribe */}
          <section className="mb-12 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Subscribe to updates:</strong> Get notified about new releases via{' '}
              <a href="https://github.com/MatMotoFix-Pro" className="text-primary hover:underline">GitHub</a> or our{' '}
              <a href="#" className="text-primary hover:underline">RSS feed</a>.
            </p>
          </section>

          {/* Version List */}
          <section className="space-y-12">
            {changes.map((change, index) => (
              <div key={change.version} className="relative">
                {/* Version Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    change.type === 'major' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    v{change.version}
                  </span>
                  <span className="text-muted-foreground">{change.date}</span>
                </div>

                {/* Change Content */}
                <div className="pl-12">
                  <h2 className="text-2xl font-semibold mb-4">{change.title}</h2>
                  
                  {/* Added */}
                  {change.changes.added.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <span>✨</span> Added
                      </h3>
                      <ul className="space-y-2">
                        {change.changes.added.map((item, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved */}
                  {change.changes.improved.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <span>🔄</span> Improved
                      </h3>
                      <ul className="space-y-2">
                        {change.changes.improved.map((item, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fixed */}
                  {change.changes.fixed.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                        <span>🐛</span> Fixed
                      </h3>
                      <ul className="space-y-2">
                        {change.changes.fixed.map((item, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Divider */}
                {index < changes.length - 1 && (
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border hidden md:block" />
                )}
              </div>
            ))}
          </section>

          {/* Version Guide */}
          <section className="mt-16 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Versioning Guide</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="font-medium">Major (x.0.0)</span>
                </div>
                <p className="text-muted-foreground">Breaking changes, significant new features</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="font-medium">Minor (1.x.0)</span>
                </div>
                <p className="text-muted-foreground">New features, backward compatible</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="font-medium">Patch (1.0.x)</span>
                </div>
                <p className="text-muted-foreground">Bug fixes, small improvements</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

