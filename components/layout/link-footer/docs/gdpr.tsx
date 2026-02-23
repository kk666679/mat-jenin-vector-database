import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'GDPR - MatJenin',
  description: 'Information about MatJenin GDPR compliance and data protection.',
};

export default function GDPR() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">GDPR Compliance</h1>
            <p className="text-muted-foreground">
              How MatJenin handles personal data in compliance with the General Data Protection Regulation (GDPR).
            </p>
          </section>

          {/* Overview */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              The General Data Protection Regulation (GDPR) is a comprehensive data protection law in the European Union 
              that came into effect on May 25, 2018. At MatJenin AI, we take data protection seriously and are committed 
              to complying with GDPR requirements.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect and process personal data necessary for providing our services. This includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> Name, email address, company name</li>
              <li><strong>Usage Data:</strong> How you use our platform, features accessed</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Communication Data:</strong> Support inquiries, feedback</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">3. Legal Basis for Processing</h2>
            <p className="text-muted-foreground mb-4">
              We process personal data based on the following legal grounds:
            </p>
            <div className="space-y-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Contract Performance</h3>
                <p className="text-muted-foreground">
                  Processing necessary to provide our services as outlined in our Terms of Service.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Legitimate Interest</h3>
                <p className="text-muted-foreground">
                  Processing for our legitimate business interests, such as improving our services and security.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Consent</h3>
                <p className="text-muted-foreground">
                  Where required, we obtain explicit consent for specific processing activities.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">4. Your Rights Under GDPR</h2>
            <p className="text-muted-foreground mb-6">
              As a data subject, you have the following rights:
            </p>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Access</h3>
                <p className="text-muted-foreground text-sm">
                  You can request a copy of all personal data we hold about you.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Rectification</h3>
                <p className="text-muted-foreground text-sm">
                  You can request correction of inaccurate personal data.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Erasure</h3>
                <p className="text-muted-foreground text-sm">
                  You can request deletion of your personal data ("right to be forgotten").
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Data Portability</h3>
                <p className="text-muted-foreground text-sm">
                  You can request your data in a structured, machine-readable format.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Object</h3>
                <p className="text-muted-foreground text-sm">
                  You can object to processing based on legitimate interests.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Right to Withdraw Consent</h3>
                <p className="text-muted-foreground text-sm">
                  You can withdraw consent at any time for processing based on consent.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement robust technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Encryption at rest and in transit (TLS 1.3)</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
              <li>Data minimization principles</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain personal data only for as long as necessary to fulfill the purposes for which we collected it:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4">Data Type</th>
                    <th className="text-left py-3">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pr-4">Account Data</td>
                    <td className="py-3">Duration of account + 30 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">Usage Analytics</td>
                    <td className="py-3">24 months</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4">Support Tickets</td>
                    <td className="py-3">3 years after closure</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Security Logs</td>
                    <td className="py-3">12 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be transferred and processed in countries outside the European Economic Area (EEA). 
              We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the 
              European Commission, to protect your data during international transfers.
            </p>
          </section>

          {/* Data Protection Officer */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">8. Data Protection Officer</h2>
            <p className="text-muted-foreground mb-4">
              We have appointed a Data Protection Officer (DPO) to oversee our data protection practices. 
              For GDPR-related inquiries, you can contact:
            </p>
            <div className="p-6 border rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> support@matjenin.space<br />
                <strong>Address:</strong> MatJenin, Data Protection Officer, San Francisco, CA
              </p>
            </div>
          </section>

          {/* Complaints */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">9. Right to Lodge a Complaint</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you believe your data protection rights have been violated, you have the right to lodge a complaint 
              with the relevant data protection authority in your country. In the EU, you can contact the Data 
              Protection Authority in your member state.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this GDPR information from time to time. We will notify you of any material changes 
              by posting the updated version on our website and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

