import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Support - MatJenin',
  description: 'Get help with MatJenin - documentation, tutorials, and contact options.',
};

export default function Support() {
  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and API reference',
      icon: '📚',
      link: '/link-footer/docs/documentation'
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation with examples',
      icon: '🔌',
      link: '/link-footer/docs/api-reference'
    },
    {
      title: 'Community',
      description: 'Connect with other developers',
      icon: '💬',
      link: '/link-footer/docs/community'
    },
    {
      title: 'Status Page',
      description: 'Check system status and uptime',
      icon: '📊',
      link: 'https://status.matjenin.space'
    }
  ];

  const topics = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button on our homepage, enter your email and password, and verify your email address.'
        },
        {
          q: 'How do I upload my first document?',
          a: 'Navigate to the Documents section in your dashboard, click "Upload", and select your file. We support PDF, TXT, MD, and more.'
        },
        {
          q: 'How do I make my first query?',
          a: 'Use the Query interface in your dashboard, or use our API. Enter your question and we will search your documents.'
        }
      ]
    },
    {
      category: 'Billing & Plans',
      questions: [
        {
          q: 'How do I upgrade my plan?',
          a: 'Go to Settings > Billing in your dashboard, select your desired plan, and complete the upgrade process.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Yes, we offer a 30-day money-back guarantee for annual plans. Contact support for details.'
        }
      ]
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What file formats do you support?',
          a: 'We support PDF, TXT, MD, DOCX, HTML, and more. See our documentation for the complete list.'
        },
        {
          q: 'How does vector search work?',
          a: 'Documents are processed to create vector embeddings. Your query is also converted to a vector, and we find the most similar documents.'
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, we use encryption at rest and in transit, and each tenant has isolated data storage.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      email: 'support@matjenin.space',
      response: '24-48 hours'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our team',
      response: 'Real-time'
    },
    {
      title: 'Enterprise Support',
      description: 'Priority support for Enterprise',
      email: 'support@matjenin.space',
      response: '1 hour'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers, get help, and learn how to make the most of MatJenin.
            </p>
          </section>

          {/* Quick Resources */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-4">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.link}
                  className="p-6 border rounded-xl hover:shadow-lg transition-shadow text-center"
                >
                  <span className="text-3xl mb-3 block">{resource.icon}</span>
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Search */}
          <section className="mb-16">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full px-6 py-4 text-lg border rounded-xl bg-muted"
              />
            </div>
          </section>

          {/* FAQ Topics */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              {topics.map((topic, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold mb-4">{topic.category}</h2>
                  <div className="space-y-4">
                    {topic.questions.map((item, i) => (
                      <details key={i} className="border rounded-lg">
                        <summary className="p-4 cursor-pointer font-medium">
                          {item.q}
                        </summary>
                        <div className="px-4 pb-4 text-sm text-muted-foreground">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Options */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <div key={index} className="p-6 border rounded-xl text-center">
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground mb-2">{option.description}</p>
                  {option.email && (
                    <a href={`mailto:${option.email}`} className="text-primary hover:underline block mb-2">
                      {option.email}
                    </a>
                  )}
                  <span className="text-sm text-muted-foreground">Response: {option.response}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Help Form */}
          <section>
            <div className="max-w-2xl mx-auto">
              <div className="p-8 border rounded-xl">
                <h2 className="text-2xl font-semibold mb-6 text-center">Send us a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select className="w-full px-4 py-3 rounded-lg border bg-background">
                      <option>Select a topic</option>
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
                      placeholder="Describe your issue..."
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
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

