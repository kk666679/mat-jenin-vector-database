import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - MatJenin',
  description: 'Simple, transparent pricing for teams of all sizes.',
};

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for testing and small projects',
      features: [
        'Up to 100 documents',
        '1,000 vectors',
        '100 queries/month',
        'Community support',
        'Basic analytics'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      description: 'For growing teams and production apps',
      features: [
        '10,000 documents',
        '100,000 vectors',
        '10,000 queries/month',
        'Priority support',
        'Advanced analytics',
        'API keys',
        'Custom embeddings',
        'Webhooks'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited documents',
        'Unlimited vectors',
        'Unlimited queries',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'On-premise option',
        'Advanced security',
        'Dedicated infrastructure'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'What happens when I exceed my plan limits?',
      answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade your plan or purchase additional capacity at any time.'
    },
    {
      question: 'Can I change plans at any time?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the difference.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for annual plans. Contact support for details.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees, no surprises.
            </p>
          </section>

          {/* Pricing Cards */}
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`p-8 border rounded-2xl ${
                    plan.popular 
                      ? 'border-primary shadow-lg relative' 
                      : 'hover:shadow-lg transition-shadow'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-input bg-background hover:bg-accent'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Comparison */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">Free</th>
                    <th className="text-center py-4 px-4">Pro</th>
                    <th className="text-center py-4 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">Documents</td>
                    <td className="py-4 px-4 text-center">100</td>
                    <td className="py-4 px-4 text-center">10,000</td>
                    <td className="py-4 px-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Vectors</td>
                    <td className="py-4 px-4 text-center">1,000</td>
                    <td className="py-4 px-4 text-center">100,000</td>
                    <td className="py-4 px-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Queries/month</td>
                    <td className="py-4 px-4 text-center">100</td>
                    <td className="py-4 px-4 text-center">10,000</td>
                    <td className="py-4 px-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">API Keys</td>
                    <td className="py-4 px-4 text-center">-</td>
                    <td className="py-4 px-4 text-center">✓</td>
                    <td className="py-4 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Custom Embeddings</td>
                    <td className="py-4 px-4 text-center">-</td>
                    <td className="py-4 px-4 text-center">✓</td>
                    <td className="py-4 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Webhooks</td>
                    <td className="py-4 px-4 text-center">-</td>
                    <td className="py-4 px-4 text-center">✓</td>
                    <td className="py-4 px-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">SLA</td>
                    <td className="py-4 px-4 text-center">-</td>
                    <td className="py-4 px-4 text-center">99.9%</td>
                    <td className="py-4 px-4 text-center">99.99%</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Support</td>
                    <td className="py-4 px-4 text-center">Community</td>
                    <td className="py-4 px-4 text-center">Priority</td>
                    <td className="py-4 px-4 text-center">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you find the right plan for your needs.
              </p>
              <Link
                href="/link-footer/docs/contact"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

