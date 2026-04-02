import { Button } from '@/components/ui/button';
import { Layout, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsAndConditions() {
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
        <h1 className="text-3xl font-bold mb-2" data-testid="text-terms-title">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms and Conditions ("Terms") govern your use of the Slide Designer application ("Service") operated by Krykk Ltd, a company registered in England and Wales under company number 15883695 ("Company", "we", "us", or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
            <p className="text-muted-foreground leading-relaxed">
              "User" refers to any individual who accesses or uses the Service. "Content" refers to any slides, projects, data, images, or other materials created, uploaded, or stored through the Service. "Account" refers to your registered user profile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate, current, and complete information during registration. You must notify us immediately of any unauthorised use of your account by contacting support@krykk.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may use the Service for lawful purposes only. You agree not to: (a) use the Service to create, store, or distribute content that is unlawful, harmful, or infringes on third-party rights; (b) attempt to interfere with or disrupt the Service or its infrastructure; (c) reverse engineer, decompile, or disassemble any part of the Service; (d) use automated tools to access the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, features, and underlying technology, is owned by Krykk Ltd and is protected by intellectual property laws. You retain ownership of the Content you create using the Service. By using the Service, you grant us a limited licence to store, process, and display your Content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We store your projects and data on secure cloud infrastructure. While we take reasonable measures to protect your data, we cannot guarantee absolute security. You are responsible for maintaining backups of your Content. We recommend regularly exporting your projects.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time through the account settings. Upon deletion, all your data, projects, snapshots, and associated content will be permanently removed and cannot be recovered. We reserve the right to suspend or terminate your account if you violate these Terms or for any other reason at our discretion, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, Krykk Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page with a revised "Last updated" date. Your continued use of the Service after changes are posted constitutes your acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-2 text-muted-foreground">
              <p>Krykk Ltd</p>
              <p>Company Number: 15883695</p>
              <p>Email: <a href="mailto:support@krykk.com" className="text-primary hover:underline">support@krykk.com</a></p>
            </div>
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
