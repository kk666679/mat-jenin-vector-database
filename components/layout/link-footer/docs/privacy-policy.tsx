import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Privacy Policy - MatJenin',
  description: 'Learn how MatJenin protects your privacy and handles your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At MatJenin ("we," "us," or "our"), we are committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our website and application (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Personal Data</h3>
                <p className="text-muted-foreground mb-3">
                  Personally identifiable information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Register for an account</li>
                  <li>Use our Service</li>
                  <li>Contact us for support</li>
                  <li>Subscribe to our newsletter</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  This may include your name, email address, phone number, company name, job title, 
                  and payment information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Usage Data</h3>
                <p className="text-muted-foreground">
                  We may also collect information about how you access and use the Service. 
                  This usage data may include your IP address, browser type, operating system, 
                  access times, and pages viewed.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Customer Data</h3>
                <p className="text-muted-foreground">
                  When you use our Service to process documents and queries, we process your content 
                  (documents, files, text) solely for the purpose of providing our services to you. 
                  This data is stored securely and is only accessible by you.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to outside parties 
                except in the following circumstances:
              </p>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Service Providers</h3>
                <p className="text-muted-foreground text-sm">
                  We may share your information with third-party vendors who assist us in operating 
                  our Service, conducting our business, or serving our users.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Legal Requirements</h3>
                <p className="text-muted-foreground text-sm">
                  We may disclose your information when required by law or in response to valid requests 
                  by public authorities.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Business Transfers</h3>
                <p className="text-muted-foreground text-sm">
                  Your information may be transferred in connection with a merger, sale of company assets, 
                  or acquisition.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, no method 
              of transmission over the Internet is 100% secure.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Encryption of data in transit (TLS 1.3)</li>
              <li>Encryption of data at rest</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on security</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will retain your personal information only for as long as is necessary for the purposes 
              set out in this Privacy Policy. We will retain and use your information to the extent 
              necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at privacy@matjenin.space.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service may contain links to third-party websites, services, or applications that are not 
              operated by us. We have no control over and assume no responsibility for the content, privacy 
              policies, or practices of any third-party sites.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for use by children under the age of 13. We do not knowingly 
              collect personally identifiable information from children under 13. If you become aware 
              that a child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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

