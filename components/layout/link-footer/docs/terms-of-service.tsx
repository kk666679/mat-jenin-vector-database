import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Terms of Service - MatJenin',
  description: 'Terms of Service for MatJenin platform.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: January 1, 2026
            </p>
          </section>

          {/* Introduction */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using MatJenin ("Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. Additionally, when using MatJenin&apos;s services, you 
              shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          {/* Description of Service */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              MatJenin provides a multi-tenant vector database and Retrieval-Augmented Generation (RAG) platform 
              that enables users to store, search, and query document embeddings. The Service includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Document upload and processing</li>
              <li>Vector embedding generation and storage</li>
              <li>Semantic search capabilities</li>
              <li>RAG query interface</li>
              <li>API access and SDK tools</li>
              <li>Analytics and usage reporting</li>
            </ul>
          </section>

          {/* User Obligations */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">3. User Obligations</h2>
            <p className="text-muted-foreground mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account credentials with others</li>
              <li>Not use the Service for any illegal purpose</li>
              <li>Not attempt to gain unauthorized access to the Service</li>
              <li>Not interfere with or disrupt the Service</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">4. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use the Service, you must create an account. You agree to provide accurate, current, and complete 
              information during the registration process and to update such information to keep it accurate, current, 
              and complete. You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>
          </section>

          {/* Payment Terms */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some features of the Service require payment. By selecting a paid plan, you agree to pay the 
              applicable fees. All payments are non-refundable unless otherwise specified.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fees are billed in advance on a monthly or annual basis</li>
              <li>You can cancel your subscription at any time</li>
              <li>We reserve the right to change our fees with 30 days notice</li>
              <li>All fees are exclusive of applicable taxes</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are and will remain the exclusive 
              property of MatJenin AI and its licensors. The Service is protected by copyright, trademark, and 
              other laws. You may not copy, modify, distribute, sell, or lease any part of the Service without 
              our prior written consent.
            </p>
          </section>

          {/* User Content */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of any content you upload, submit, or transmit to the Service ("User Content"). 
              By uploading User Content, you grant MatJenin AI a worldwide, non-exclusive, royalty-free license to 
              use, store, and process your User Content solely for the purpose of providing the Service to you.
            </p>
            <p className="text-muted-foreground">
              You represent and warrant that you have all rights necessary to grant this license and that your 
              User Content does not infringe the rights of any third party.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall MatJenin, its officers, directors, employees, or agents, be liable to you for 
              any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
              loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your use or 
              inability to use the Service; (ii) any unauthorized access to or use of our servers; (iii) any 
              interruption or cessation of transmission to or from the Service.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. MatJenin makes no 
              representations or warranties of any kind, express or implied, as to the operation of the Service, 
              or the information, content, or materials included therein. You expressly agree that your use of 
              the Service is at your sole risk.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless MatJenin and its officers, directors, employees, 
              and agents from and against any claims, liabilities, damages, losses, or expenses, including 
              reasonable attorneys&apos; fees, arising out of or in any way connected with your access to or use 
              of the Service or your violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any 
              reason whatsoever, including without limitation if you breach the Terms. Upon termination, your 
              right to use the Service will immediately cease.
            </p>
            <p className="text-muted-foreground">
              You may cancel your account at any time by contacting support@matjenin.space.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the State of California, 
              United States, without regard to its conflict of law provisions. Our failure to enforce any right 
              or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will try to provide at least 30 days notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="p-6 border rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> support@matjenin.space<br />
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

