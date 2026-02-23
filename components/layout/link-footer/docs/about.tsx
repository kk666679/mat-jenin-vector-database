import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'About Us - MatJenin',
  description: 'Learn about MatJenin, our mission, and our team.',
};

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About MatJenin</h1>
            <p className="text-xl text-muted-foreground">
              Transforming enterprise data into intelligent solutions.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At MatJenin, we believe that enterprise data holds untapped potential. 
              Our mission is to democratize AI-powered search and knowledge retrieval, 
              making it accessible, secure, and scalable for organizations of all sizes.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              We are building the next generation of enterprise intelligence platforms—ones that 
              turn scattered repositories into a unified AI-powered knowledge layer, enabling 
              enterprises to search smarter, automate faster, and scale intelligence securely.
            </p>
          </section>

          {/* What We Do Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">Vector Database</h3>
                <p className="text-muted-foreground">
                  Store and search high-dimensional embeddings with lightning-fast performance. 
                  Our vector database enables semantic search that understands context, not just keywords.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">RAG Platform</h3>
                <p className="text-muted-foreground">
                  Build AI-powered applications with Retrieval-Augmented Generation. 
                  Combine the power of LLMs with your enterprise data for accurate, contextual responses.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">Multi-Tenant Security</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade isolation ensures your data remains secure. 
                  Each tenant operates in complete isolation with dedicated resources and access controls.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-medium mb-3">Real-time Processing</h3>
                <p className="text-muted-foreground">
                  Process documents and generate embeddings in real-time. 
                  Our streaming architecture delivers token-by-token responses for seamless user experiences.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <div>
                  <strong className="block">Innovation</strong>
                  <span className="text-muted-foreground">We constantly push the boundaries of what&apos;s possible with AI technology.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <div>
                  <strong className="block">Security First</strong>
                  <span className="text-muted-foreground">Data protection is at the core of everything we build.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <div>
                  <strong className="block">Customer Success</strong>
                  <span className="text-muted-foreground">Your growth is our success. We&apos;re committed to your journey.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">✓</span>
                <div>
                  <strong className="block">Transparency</strong>
                  <span className="text-muted-foreground">Open communication and clear documentation are our standards.</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Leadership Team</h2>
            <p className="text-muted-foreground mb-6">
              Our team combines decades of experience in AI, distributed systems, and enterprise software.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👨‍💻</span>
                </div>
                <h3 className="font-semibold">Technical Excellence</h3>
                <p className="text-sm text-muted-foreground">Built by engineers who understand scale</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-semibold">Security Experts</h3>
                <p className="text-sm text-muted-foreground">Industry veterans in data protection</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="font-semibold">AI Pioneers</h3>
                <p className="text-sm text-muted-foreground">Researchers pushing AI boundaries</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-16">
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of enterprises already using MatJenin to transform their data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/link-footer/docs/pricing" 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Pricing
                </Link>
                <Link 
                  href="/link-footer/docs/contact" 
                  className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
                >
                  Contact Sales
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

