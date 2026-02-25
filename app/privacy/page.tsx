import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description: 'Learn how Embuni Campus Market protects your privacy and handles your data.',
  keywords: ['privacy policy', 'data protection', 'privacy', 'campus market'],
  canonical: '/privacy',
});

export default function PrivacyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy', url: '/privacy' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Last updated: February 24, 2025
        </p>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                At Embuni Campus Market, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-muted-foreground">
                By using Embuni Campus Market, you agree to the collection and use of information in accordance
                with this policy. If you disagree with any part of this policy, please do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
              <p className="text-muted-foreground mb-4">We collect information you provide directly to us:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password, and profile picture</li>
                <li><strong>Location:</strong> Campus location or general area for delivery purposes</li>
                <li><strong>Payment Information:</strong> M-Pesa phone number for transactions (processed securely)</li>
                <li><strong>Product Information:</strong> Details, descriptions, and photos of items you list</li>
                <li><strong>Communications:</strong> Messages sent between users and support communications</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-4">We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and click patterns</li>
                <li><strong>Log Information:</strong> Access times, referral sources, and navigation paths</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Cookies and Tracking</h3>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to collect information, remember your preferences, and
                improve your experience. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the collected information for various purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our platform</li>
                <li><strong>Transaction Processing:</strong> To process payments and facilitate transactions</li>
                <li><strong>Communication:</strong> To send updates, security alerts, and support messages</li>
                <li><strong>Account Management:</strong> To create and manage your account</li>
                <li><strong>Personalization:</strong> To customize your experience and show relevant content</li>
                <li><strong>Safety:</strong> To detect, prevent, and address fraudulent or illegal activities</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">We respect your privacy and do not sell your personal information. We may share information in the following circumstances:</p>

              <h3 className="text-xl font-semibold mb-3 mt-6">With Other Users</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Profile information (name, photo, verification status) is visible to other users</li>
                <li>Product listings are visible to all platform visitors</li>
                <li>Contact information is shared only when a transaction is initiated</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">With Service Providers</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Payment Processors:</strong> M-Pesa for payment processing</li>
                <li><strong>Hosting Services:</strong> Third-party hosting and infrastructure providers</li>
                <li><strong>Analytics Services:</strong> Tools that help us understand platform usage</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                These service providers have access to personal information only to perform specific tasks on our behalf.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">For Legal Reasons</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>To comply with legal requirements, court orders, or government requests</li>
                <li>To protect our rights, property, and safety</li>
                <li>To prevent fraud or illegal activities</li>
                <li>To enforce our Terms of Service</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Business Transfers</h3>
              <p className="text-muted-foreground">
                In the event of a merger, acquisition, or sale of assets, user information may be transferred to the new owner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit using HTTPS</li>
                <li><strong>Secure Payments:</strong> Payment processing is handled through secure M-Pesa integration</li>
                <li><strong>Access Controls:</strong> Access to personal data is restricted to authorized personnel</li>
                <li><strong>Regular Audits:</strong> We regularly review our security practices</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect
                your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You may request deletion of your account, which will remove your personal information from our
                active databases. However, we may retain certain information as required by law or for legitimate
                business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Your Privacy Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Restriction:</strong> Request limitation of data processing</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us at support@embunicampus.market. We will respond to
                your request within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
              <p className="text-muted-foreground mb-4">
                Our platform may contain links to third-party websites. We are not responsible for the privacy
                practices of these external sites. We encourage you to read the privacy policies of any third-party
                websites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Embuni Campus Market is not intended for children under 18 years of age. We do not knowingly collect
                personal information from children. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify users of significant changes
                via email or platform announcements. The updated policy will be effective immediately upon posting.
                We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <p className="text-muted-foreground">
                Email: support@embunicampus.market<br/>
                Location: Embu University Campus, Embu, Kenya<br/><br/>
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
