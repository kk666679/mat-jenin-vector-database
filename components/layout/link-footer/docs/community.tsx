import Footer from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Community - MatJenin AI',
  description: 'Join the MatJenin community, connect with developers, and share knowledge.',
};

export default function Community() {
  const channels = [
    {
      name: 'GitHub Discussions',
      description: 'Ask questions, share your projects, and connect with other developers.',
      icon: '💬',
      link: 'https://github.com/MatMotoFix-Pro',
      members: '5,000+'
    },
    {
      name: 'Discord Server',
      description: 'Real-time chat with the team and community members.',
      icon: '🎮',
      link: '#',
      members: '3,500+'
    },
    {
      name: 'Twitter',
      description: 'Follow us for updates, tips, and community highlights.',
      icon: '🐦',
      link: 'https://twitter.com/',
      members: '10,000+'
    },
    {
      name: 'LinkedIn',
      description: 'Connect with professionals and stay updated on news.',
      icon: '💼',
      link: 'https://linkedin.com/',
      members: '8,000+'
    }
  ];

  const events = [
    {
      title: 'Monthly Community Call',
      date: 'Every 1st Wednesday',
      type: 'Online'
    },
    {
      title: 'Hackathon 2025',
      date: 'March 15-17, 2025',
      type: 'Online'
    },
    {
      title: 'Workshop: Building RAG Apps',
      date: 'February 20, 2025',
      type: 'Online'
    },
    {
      title: 'Office Hours',
      date: 'Every Friday',
      type: 'Online'
    }
  ];

  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and API reference.',
      icon: '📚',
      link: '/link-footer/docs/documentation'
    },
    {
      title: 'API Reference',
      description: 'Complete API documentation with examples.',
      icon: '🔌',
      link: '/link-footer/docs/api-reference'
    },
    {
      title: 'GitHub',
      description: 'Open source repositories and examples.',
      icon: '🐙',
      link: 'https://github.com/MatMotoFix-Pro'
    },
    {
      title: 'Stack Overflow',
      description: 'Q&A with the community.',
      icon: '📋',
      link: '#'
    }
  ];

  const contributors = [
    { name: 'Alex Chen', role: 'Top Contributor', commits: 150 },
    { name: 'Maria Garcia', role: 'Documentation', commits: 89 },
    { name: 'John Smith', role: 'Community MVP', commits: 67 },
    { name: 'Sarah Johnson', role: 'Bug Hunter', commits: 45 },
    { name: 'Michael Brown', role: 'Plugin Author', commits: 34 },
    { name: 'Emily Davis', role: 'Translator', commits: 28 }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <section className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers building with MatJenin. Connect, learn, and grow together.
            </p>
          </section>

          {/* Community Stats */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-muted-foreground">Total Users</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">15K+</div>
                <div className="text-muted-foreground">Active Developers</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-muted-foreground">Open Source Projects</div>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-3xl font-bold mb-2">1M+</div>
                <div className="text-muted-foreground">API Requests/Day</div>
              </div>
            </div>
          </section>

          {/* Community Channels */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Join the Conversation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {channels.map((channel, index) => (
                <a
                  key={index}
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 border rounded-lg hover:shadow-lg transition-shadow flex items-start gap-4"
                >
                  <span className="text-4xl">{channel.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{channel.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{channel.description}</p>
                    <span className="text-sm text-primary">{channel.members} members</span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Events */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Community Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((event, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{event.date}</p>
                  <span className="text-xs px-2 py-1 bg-muted rounded">{event.type}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Learning Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.link}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-2xl mb-2 block">{resource.icon}</span>
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Top Contributors */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Top Contributors</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-right p-4">Contributions</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map((contributor, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">{contributor.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                          {contributor.role}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">{contributor.commits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Contributing */}
          <section className="mb-16">
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Contribute to MatJenin</h2>
              <p className="text-muted-foreground mb-6">
                We welcome contributions from the community! Whether it&apos;s bug reports, feature requests, 
                documentation improvements, or new features — every contribution helps.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/MatMotoFix-Pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Contribute on GitHub
                </a>
                <Link
                  href="/link-footer/docs/documentation"
                  className="px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
                >
                  Read Contributing Guide
                </Link>
              </div>
            </div>
          </section>

          {/* Code of Conduct */}
          <section>
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Community Code of Conduct</h2>
              <p className="text-muted-foreground mb-4">
                We are committed to providing a welcoming and inclusive experience for everyone. 
                Please read our full code of conduct before participating in our community.
              </p>
              <Link
                href="#"
                className="text-primary hover:underline"
              >
                Read Code of Conduct →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

