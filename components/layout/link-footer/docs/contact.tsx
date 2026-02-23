import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Us - MatJenin',
  description: 'Get in touch with the MatJenin team for support, sales, or general inquiries.',
};

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We&apos;d love to hear from you. Our team is here to help.
            </p>
          </section>

          {/* Contact Methods */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Chat with our support team in real-time.
                </p>
                <button className="text-primary font-medium hover:underline">
                  Start Chat →
                </button>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">
                  Send us an email and we&apos;ll respond within 24 hours.
                </p>
                <a href="mailto:support@matjenin.space" className="text-primary font-medium hover:underline">
                  support@matjenin.space
                </a>
              </div>
              <div className="p-6 border rounded-lg text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Check our docs for answers to common questions.
                </p>
                <Link href="/link-footer/docs/documentation" className="text-primary font-medium hover:underline">
                  View Docs →
                </Link>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-3 rounded-lg border bg-background"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-3 rounded-lg border bg-background"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    >
                      <option value="">Select a topic</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Other Ways to Reach Us</h2>
                
                <div className="space-y-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Sales Inquiries</h3>
                    <p className="text-muted-foreground mb-4">
                      Interested in enterprise features or custom pricing? Our sales team is here to help.
                    </p>
                    <a href="mailto:sales@matjenin.space" className="text-primary font-medium hover:underline">
                      sales@matjenin.space
                    </a>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
                    <p className="text-muted-foreground mb-4">
                      Having issues with the platform? Our support team can help troubleshoot.
                    </p>
                    <a href="mailto:support@matjenin.space" className="text-primary font-medium hover:underline">
                      support@matjenin.space
                    </a>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Partnership Opportunities</h3>
                    <p className="text-muted-foreground mb-4">
                      Interested in partnering with us? Let&apos;s talk about how we can work together.
                    </p>
                    <a href="mailto:partners@matjenin.space" className="text-primary font-medium hover:underline">
                      partners@matjenin.space
                    </a>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Headquarters</h3>
                    <p className="text-muted-foreground">
                      MatJenin<br />
                      Kuala Lumpur, MY<br />
                      Malaysia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Response Time */}
          <section className="mb-16">
            <div className="p-8 bg-muted rounded-xl">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">Less than 1hr</div>
                  <div className="text-muted-foreground">Live Chat Response</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24hrs</div>
                  <div className="text-muted-foreground">Email Response</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-muted-foreground">Enterprise Support</div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Teaser */}
          <section>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mb-6">
                Check our documentation for answers to common questions.
              </p>
              <Link
                href="/link-footer/docs/documentation"
                className="inline-block px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
              >
                View FAQ
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

