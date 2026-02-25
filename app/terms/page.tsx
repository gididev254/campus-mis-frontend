import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service',
  description: 'Read the terms of service for using Embuni Campus Market. Understand your rights and responsibilities.',
  keywords: ['terms of service', 'legal', 'terms and conditions', 'campus market'],
  canonical: '/terms',
});

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms', url: '/terms' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Terms of <span className="text-primary">Service</span>
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
                Welcome to Embuni Campus Market. These Terms of Service ("Terms") govern your use of our platform,
                services, and website. By accessing or using Embuni Campus Market, you agree to be bound by these Terms.
              </p>
              <p className="text-muted-foreground">
                Embuni Campus Market is a peer-to-peer marketplace designed specifically for the Embu University
                campus community. Our platform enables students to buy and sell products in a safe, secure environment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Account Registration</h2>
              <p className="text-muted-foreground mb-4">To use our platform, you must:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Be at least 18 years old</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Be a member of the Embu University community (student, faculty, or staff)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You are responsible for all activities that occur under your account. You must notify us immediately
                of any unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">As a user of Embuni Campus Market, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>List only items that you have the right to sell</li>
                <li>Provide accurate descriptions and images of products</li>
                <li>Respond to buyer inquiries in a timely manner</li>
                <li>Fulfill orders as described and in good condition</li>
                <li>Pay for items promptly when making purchases</li>
                <li>Treat all users with respect and professionalism</li>
                <li>Not attempt to circumvent our payment system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Prohibited Items</h2>
              <p className="text-muted-foreground mb-4">The following items are strictly prohibited on our platform:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Illegal items or controlled substances</li>
                <li>Weapons of any kind</li>
                <li>Counterfeit or stolen goods</li>
                <li>Items that infringe on intellectual property rights</li>
                <li>Adult content or inappropriate materials</li>
                <li>Items that violate campus policies or local laws</li>
                <li>Hazardous materials or dangerous goods</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Violation of these prohibitions will result in immediate account suspension and possible legal action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Payment and Fees</h2>
              <p className="text-muted-foreground mb-4">
                All payments are processed through our secure M-Pesa integration. By using our platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Pay the listed price for purchased items</li>
                <li>Pay applicable transaction fees on successful sales</li>
                <li>Not attempt to avoid payment processing fees</li>
                <li>Provide accurate payment information</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Sellers receive payment (minus transaction fees) after the buyer confirms receipt of the item.
                Transaction fees are displayed during the listing process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Buyer and Seller Protections</h2>
              <p className="text-muted-foreground mb-4">
                We strive to provide a safe marketplace but cannot guarantee every transaction. Our protections include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Secure payment processing through M-Pesa</li>
                <li>Dispute resolution for transaction issues</li>
                <li>Review and rating system for user feedback</li>
                <li>Verification badges for trusted sellers</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We are not responsible for the quality, safety, or legality of items listed. All transactions are
                between buyers and sellers directly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Returns and Refunds</h2>
              <p className="text-muted-foreground mb-4">
                Returns and refunds are handled on a case-by-case basis. Buyers may request a return if:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The item received doesn't match the description</li>
                <li>The item is damaged or defective upon arrival</li>
                <li>The item is counterfeit or significantly not as described</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Return requests must be made within 48 hours of delivery. We reserve the right to mediate disputes
                and make final decisions on refunds.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">You may not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use the platform for fraudulent activities</li>
                <li>Create multiple accounts without permission</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Spam or harass other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the operation of the platform</li>
                <li>Use automated tools to scrape or mine data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on Embuni Campus Market, including text, graphics, logos, and software, is owned by
                us or our licensors and is protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Copy, modify, or distribute our content</li>
                <li>Use our trademarks without permission</li>
                <li>Reverse engineer our platform or software</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                By listing items, you grant us a license to display and promote them on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Account Suspension and Termination</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to suspend or terminate accounts that violate these Terms, engage in
                fraudulent activities, or harm the platform. Actions may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Temporary account suspension</li>
                <li>Permanent account termination</li>
                <li>Loss of pending transactions</li>
                <li>Legal action for serious violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                Disputes between users will be handled through our resolution process. We encourage users to
                resolve issues directly first. If needed, our team will mediate and make a final decision based
                on evidence provided by both parties.
              </p>
              <p className="text-muted-foreground">
                By using our platform, you agree to these dispute resolution procedures and waive any right to
                pursue legal action for disputes covered by this process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Embuni Campus Market is provided "as is" without warranties of any kind. We are not liable for:
                indirect, incidental, special, or consequential damages arising from your use of the platform.
                Our total liability is limited to the amount of fees you have paid to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. We will notify users of significant changes via email
                or platform announcements. Continued use of the platform after changes constitutes acceptance of
                the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">14. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of Kenya. Any disputes arising from these Terms will be
                resolved in Kenyan courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <p className="text-muted-foreground">
                Email: support@embunicampus.market<br/>
                Location: Embu University Campus, Embu, Kenya
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
