import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'API Reference - MatJenin',
  description: 'Complete API reference documentation for MatJenin platform.',
};

export default function APIReference() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">API Reference</h1>
            <p className="text-xl text-muted-foreground">
              Complete reference documentation for the MatJenin API.
            </p>
          </section>

          {/* Base URL */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">https://api.matjenin.space/v1</code>
            </div>
          </section>

          {/* Authentication */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              MatJenin uses API keys for authentication. You can generate API keys from the dashboard.
            </p>
            <div className="p-4 bg-muted rounded-lg mb-4">
              <p className="text-sm font-mono">Authorization: Bearer YOUR_API_KEY</p>
            </div>
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Security Note:</strong> Keep your API keys secure. Never expose them in client-side code or public repositories.
              </p>
            </div>
          </section>

          {/* Rate Limiting */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4">Plan</th>
                    <th className="text-left py-3 pr-4">Requests/Min</th>
                    <th className="text-left py-3">Requests/Hour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pr-4">Free</td>
                    <td className="py-3 pr-4">60</td>
                    <td className="py-3">1,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">Pro</td>
                    <td className="py-3 pr-4">300</td>
                    <td className="py-3">10,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Enterprise</td>
                    <td className="py-3 pr-4">Custom</td>
                    <td className="py-3">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Endpoints */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

            {/* Documents */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Documents</h3>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm font-medium">POST</span>
                    <code className="text-lg">/api/documents</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Upload a new document for processing.</p>
                  
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <pre className="text-sm overflow-x-auto">
{`{
  "title": "Document Title",
  "content": "Document content...",
  "chunkSize": 512,
  "overlap": 50
}`}
                    </pre>
                  </div>
                  
                  <h4 className="font-semibold mb-2">Response</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`{
  "id": "doc_xxx",
  "title": "Document Title",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-medium">GET</span>
                    <code className="text-lg">/api/documents</code>
                  </div>
                  <p className="text-muted-foreground mb-4">List all documents.</p>
                  
                  <h4 className="font-semibold mb-2">Query Parameters</h4>
                  <ul className="list-disc list-inside text-muted-foreground mb-4">
                    <li><code>page</code> - Page number (default: 1)</li>
                    <li><code>limit</code> - Items per page (default: 20)</li>
                    <li><code>status</code> - Filter by status</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-medium">GET</span>
                    <code className="text-lg">/api/documents/:id</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Get a specific document by ID.</p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-medium">DELETE</span>
                    <code className="text-lg">/api/documents/:id</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Delete a document and all its chunks.</p>
                </div>
              </div>
            </div>

            {/* Query */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Query</h3>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm font-medium">POST</span>
                    <code className="text-lg">/api/query</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Query the vector database (non-streaming).</p>
                  
                  <h4 className="font-semibold mb-2">Request Body</h4>
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <pre className="text-sm overflow-x-auto">
{`{
  "message": "Your question here",
  "includeReasoning": true,
  "includeSources": true
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm font-medium">POST</span>
                    <code className="text-lg">/api/query/stream</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Query with streaming response.</p>
                  <p className="text-sm text-muted-foreground">
                    Returns Server-Sent Events (SSE) with token-by-token streaming.
                  </p>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-medium">GET</span>
                    <code className="text-lg">/api/query/search</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Direct vector search without LLM.</p>
                  
                  <h4 className="font-semibold mb-2">Query Parameters</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li><code>query</code> - Search query</li>
                    <li><code>topK</code> - Number of results (default: 10)</li>
                    <li><code>hybridSearch</code> - Enable hybrid search</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* tRPC */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">tRPC API</h3>
              <p className="text-muted-foreground mb-4">
                Our tRPC API provides type-safe endpoints for all operations.
              </p>
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-sm font-medium">GET</span>
                  <code className="text-lg">/api/trpc/[trpc]</code>
                </div>
                <p className="text-muted-foreground">
                  All tRPC procedures are available under this endpoint. 
                  See the <Link href="/link-footer/docs/documentation" className="text-primary hover:underline">full documentation</Link> for procedure details.
                </p>
              </div>
            </div>
          </section>

          {/* Error Codes */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Error Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4">Code</th>
                    <th className="text-left py-3 pr-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pr-4"><code>400</code></td>
                    <td className="py-3 pr-4">Bad Request - Invalid parameters</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4"><code>401</code></td>
                    <td className="py-3 pr-4">Unauthorized - Invalid or missing API key</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4"><code>403</code></td>
                    <td className="py-3 pr-4">Forbidden - Insufficient permissions</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4"><code>429</code></td>
                    <td className="py-3 pr-4">Too Many Requests - Rate limit exceeded</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4"><code>500</code></td>
                    <td className="py-3 pr-4">Internal Server Error</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4"><code>503</code></td>
                    <td className="py-3 pr-4">Service Unavailable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SDKs */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Official SDKs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">JavaScript/TypeScript</h3>
                <p className="text-muted-foreground mb-4">
                  Official Node.js and browser SDK.
                </p>
                <div className="p-3 bg-muted rounded">
                  <code className="text-sm">npm install @matjenin/sdk</code>
                </div>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">Python</h3>
                <p className="text-muted-foreground mb-4">
                  Python SDK for backend integration.
                </p>
                <div className="p-3 bg-muted rounded">
                  <code className="text-sm">pip install matjenin-ai</code>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="mb-16">
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-4">
                If you need assistance with API integration, our support team is here to help.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/link-footer/docs/support" 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/link-footer/docs/documentation" 
                  className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
                >
                  View Full Docs
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

