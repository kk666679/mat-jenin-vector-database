import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Careers - MatJenin',
  description: 'Join our team and help build the future of enterprise AI.',
};

export default function Career() {
  const openPositions = [
    {
      id: 1,
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build scalable APIs and services for our AI platform.'
    },
    {
      id: 2,
      title: 'Machine Learning Engineer',
      department: 'AI/ML',
      location: 'Remote',
      type: 'Full-time',
      description: 'Work on cutting-edge embedding models and RAG systems.'
    },
    {
      id: 3,
      title: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build beautiful, performant user interfaces for our dashboard.'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote',
      type: 'Full-time',
      description: 'Manage our distributed systems and cloud infrastructure.'
    },
    {
      id: 5,
      title: 'Technical Writer',
      department: 'Documentation',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create comprehensive documentation and API guides.'
    },
    {
      id: 6,
      title: 'Solutions Architect',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help enterprise customers design and implement solutions.'
    }
  ];

  const benefits = [
    {
      icon: '🏠',
      title: 'Remote-First',
      description: 'Work from anywhere in the world. We care about results, not desk hours.'
    },
    {
      icon: '💰',
      title: 'Competitive Salary',
      description: 'Industry-leading compensation with equity opportunities.'
    },
    {
      icon: '🏥',
      title: 'Health & Wellness',
      description: 'Comprehensive health, dental, and vision insurance.'
    },
    {
      icon: '📚',
      title: 'Learning Budget',
      description: '$2,000 annual budget for conferences, courses, and books.'
    },
    {
      icon: '🏖️',
      title: 'Unlimited PTO',
      description: 'Take time off when you need it. We trust our team.'
    },
    {
      icon: '👶',
      title: 'Parental Leave',
      description: 'Generous paid leave for new parents.'
    }
  ];

  const values = [
    {
      title: 'Build for Scale',
      description: 'We solve problems that matter at enterprise scale.'
    },
    {
      title: 'Think Long-Term',
      description: 'We make decisions that benefit our users and company long-term.'
    },
    {
      title: 'Ship Often',
      description: 'We believe in rapid iteration and continuous improvement.'
    },
    {
      title: 'Be Curious',
      description: 'We never stop learning and exploring new technologies.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the future of enterprise AI. We&apos;re looking for passionate people who want to make a difference.
            </p>
          </section>

          {/* Stats */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-muted-foreground">Team Members</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-muted-foreground">Remote</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">$50M+</div>
                <div className="text-muted-foreground">Funding</div>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div key={position.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{position.title}</h3>
                      <p className="text-muted-foreground mb-2">{position.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-2 py-1 bg-muted rounded">{position.department}</span>
                        <span className="px-2 py-1 bg-muted rounded">{position.location}</span>
                        <span className="px-2 py-1 bg-muted rounded">{position.type}</span>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Benefits & Perks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Culture */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Life at MatJenin</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  We&apos;re a team of builders, dreamers, and doers. We believe that the best work comes from 
                  people who are passionate about what they do and who have the freedom to explore new ideas.
                </p>
                <p className="text-muted-foreground">
                  Our culture is built on trust, transparency, and a commitment to excellence. 
                  We celebrate wins, learn from failures, and always strive to be better.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="h-32 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">💡</span>
                </div>
                <div className="h-32 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🤝</span>
                </div>
                <div className="h-32 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4">Don&apos;t see the right role?</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re always looking for exceptional talent. Send us your resume and we&apos;ll keep you in mind for future opportunities.
              </p>
              <Link 
                href="/link-footer/docs/contact" 
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

