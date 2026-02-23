import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Cookie Policy - MatJenin',
  description: 'Learn how MatJenin uses cookies and similar technologies.',
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains what Cookies are and how MatJenin AI ("we," "us," or "our") 
              uses them on our website and application (collectively, the "Service"). By using our Service, 
              you agree to the use of cookies as described in this policy.
            </p>
          </section>

          {/* What are Cookies */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">2. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit 
              a website. They are widely used to make websites work more efficiently and provide information 
              to website owners.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cookies allow websites to recognize your device and remember information about your visit, 
              such as your preferred language, login information, and other settings. This can make your 
              next visit easier and the site more useful to you.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These cookies are necessary for the website to function and cannot be switched off in our systems. 
                  They are usually only set in response to actions made by you, such as:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Setting your privacy preferences</li>
                  <li>Logging in or filling in forms</li>
                  <li>Remembering items in your shopping cart</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  You can set your browser to block or alert you about these cookies, but some parts of the site 
                  may not work properly.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Performance & Analytics Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. They help us:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Count visits and traffic sources</li>
                  <li>Understand which pages are most and least popular</li>
                  <li>See how visitors move around the site</li>
                  <li>Identify any errors users encounter</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
                <p className="text-muted-foreground mb-3">
                  These cookies enable enhanced functionality and personalization, such as:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Live chat support</li>
                  <li>Personalized content recommendations</li>
                  <li>Remembering your preferences</li>
                  <li>Social media integration</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Targeting Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies may be set through our site by our advertising partners. They may be used to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                  <li>Build a profile of your interests</li>
                  <li>Show you relevant advertisements on other sites</li>
                  <li>Measure the effectiveness of advertising campaigns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookie List */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">4. Specific Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4">Cookie Name</th>
                    <th className="text-left py-3 pr-4">Type</th>
                    <th className="text-left py-3 pr-4">Purpose</th>
                    <th className="text-left py-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pr-4">session_id</td>
                    <td className="py-3 pr-4">Essential</td>
                    <td className="py-3 pr-4">User session management</td>
                    <td className="py-3">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">auth_token</td>
                    <td className="py-3 pr-4">Essential</td>
                    <td className="py-3 pr-4">Authentication</td>
                    <td className="py-3">30 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">preferences</td>
                    <td className="py-3 pr-4">Functional</td>
                    <td className="py-3 pr-4">User preferences storage</td>
                    <td className="py-3">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">_ga</td>
                    <td className="py-3 pr-4">Analytics</td>
                    <td className="py-3 pr-4">Google Analytics tracking</td>
                    <td className="py-3">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">_gid</td>
                    <td className="py-3 pr-4">Analytics</td>
                    <td className="py-3 pr-4">Google Analytics tracking</td>
                    <td className="py-3">24 hours</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">csrftoken</td>
                    <td className="py-3 pr-4">Essential</td>
                    <td className="py-3 pr-4">Cross-site request forgery protection</td>
                    <td className="py-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Managing Cookies */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to decide whether to accept or reject cookies. You can manage your preferences:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings.</li>
              <li><strong>Cookie Consent Banner:</strong> Use our cookie consent tool to customize your preferences.</li>
              <li><strong>Third-Party Tools:</strong> Opt out of specific third-party analytics.</li>
            </ul>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> If you disable essential cookies, some parts of our Service may not function properly.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for 
              operational, legal, or regulatory reasons. We will post any changes on this page and update 
              the "Last updated" date at the top of this policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="p-6 border rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> privacy@matjenin.space<br />
                <strong>Address:</strong> MatJenin, Kuala Lumpur, MY, Malaysia
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

