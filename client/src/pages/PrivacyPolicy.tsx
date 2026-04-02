import { Button } from '@/components/ui/button';
import { Layout, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layout className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Slide Designer</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-privacy-title">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains how Krykk Ltd ("Company", "we", "us", or "our"), a company registered in England and Wales under company number 15883695, collects, uses, and protects your personal information when you use the Slide Designer application ("Service"). We are committed to protecting your privacy in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data Controller</h2>
            <p className="text-muted-foreground leading-relaxed">
              Krykk Ltd is the data controller responsible for your personal data. If you have questions about how we handle your data, please contact us at support@krykk.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Account Information:</strong> Email address, name, and profile image provided through your authentication provider (Google, GitHub, Apple, or Replit account).</li>
              <li><strong className="text-foreground">Usage Data:</strong> Login timestamps, number of projects created, and general usage patterns.</li>
              <li><strong className="text-foreground">Content Data:</strong> Slide projects, snapshots, and any data you create within the Service.</li>
              <li><strong className="text-foreground">Technical Data:</strong> Browser type, IP address, and session information necessary for the Service to function.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Legal Basis for Processing</h2>
            <p className="text-muted-foreground leading-relaxed">We process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Contract:</strong> Processing necessary to provide the Service to you.</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> Improving and securing the Service, preventing fraud.</li>
              <li><strong className="text-foreground">Consent:</strong> Where you have given explicit consent for specific processing activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>Provide, maintain, and improve the Service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Store and retrieve your slide projects and data</li>
              <li>Communicate with you about the Service</li>
              <li>Monitor usage for security and abuse prevention</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal data. We may share your data with: (a) service providers who assist us in operating the Service (hosting, authentication); (b) law enforcement or regulatory bodies when required by law; (c) in connection with a merger, acquisition, or sale of company assets, with appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide the Service. When you delete your account, all your personal data, projects, snapshots, and associated content are permanently deleted from our systems. We may retain anonymised, aggregated data for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">Under the UK GDPR, you have the following rights:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data (you can delete your account at any time).</li>
              <li><strong className="text-foreground">Right to Restrict Processing:</strong> Request restriction of processing in certain circumstances.</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Request transfer of your data in a structured, commonly used format (JSON export is available).</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interests.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              To exercise any of these rights, please contact us at support@krykk.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These measures include encrypted data transmission (HTTPS), secure session management, and access controls. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Cookies and Session Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential session cookies to maintain your login state and provide the Service. These cookies are strictly necessary and do not require consent. We do not use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be processed on servers located outside the UK. Where transfers occur, we ensure appropriate safeguards are in place in accordance with UK GDPR requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact and Complaints</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or complaints about our privacy practices, please contact us:
            </p>
            <div className="mt-2 text-muted-foreground">
              <p>Krykk Ltd</p>
              <p>Company Number: 15883695</p>
              <p>Email: <a href="mailto:support@krykk.com" className="text-primary hover:underline">support@krykk.com</a></p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK supervisory authority for data protection, at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Krykk Ltd (UK 15883695)</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          <span className="hidden sm:inline">|</span>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="hidden sm:inline">|</span>
          <a href="mailto:support@krykk.com" className="hover:underline">support@krykk.com</a>
        </div>
      </footer>
    </div>
  );
}
