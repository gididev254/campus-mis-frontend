import { Metadata } from 'next';
import { Heart, Users, Target, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn about Embuni Campus Market and our mission to connect students in a safe, secure campus marketplace',
  keywords: ['about us', 'campus market', 'embuni', 'student marketplace', 'our mission', 'campus trading'],
  canonical: '/about',
});

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About <span className="text-primary">Embuni Campus Market</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your trusted campus marketplace, built by students for students
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Embuni Campus Market, our mission is to create a safe, secure, and convenient marketplace
              where students can buy and sell products within the campus community. We believe in fostering
              a sustainable economy by enabling students to find great deals on quality items while helping
              others earn money from products they no longer need.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* What We Offer */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-2">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Student-to-Student</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A dedicated marketplace for students to trade safely within their campus community
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-2">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle>Secure & Trusted</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Safe transactions with M-Pesa integration and verified seller accounts
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-2">
                <Award className="h-6 w-6" />
              </div>
              <CardTitle>Easy to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simple, intuitive interface designed for the best buying and selling experience
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Story */}
      <section className="mb-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p className="text-muted-foreground mb-4">
              Embuni Campus Market was born from a simple observation: students have amazing things to sell,
              and other students are looking for great deals. We noticed how difficult it was for students
              to connect and trade safely within the campus community.
            </p>
            <p className="text-muted-foreground mb-4">
              Starting as a small initiative to solve this problem, we've grown into a thriving marketplace
              that serves thousands of students. Every day, we help students save money on textbooks,
              find affordable electronics, discover unique fashion items, and so much more.
            </p>
            <p className="text-muted-foreground">
              We're committed to continuously improving our platform and adding new features based on
              feedback from our community. Our goal is to make campus life easier, one transaction at a time.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Our Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Trust & Safety</h3>
            <p className="text-muted-foreground">
              We prioritize the security of our users and maintain high standards for all transactions
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Community First</h3>
            <p className="text-muted-foreground">
              Everything we do is centered around building a strong, supportive campus community
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Sustainability</h3>
            <p className="text-muted-foreground">
              We promote reuse and recycling to reduce waste and support a greener campus
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Transparency</h3>
            <p className="text-muted-foreground">
              Clear policies, open communication, and honest dealings in everything we do
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="text-center bg-muted/50 rounded-lg p-12">
        <h2 className="text-2xl font-bold mb-4">Want to Learn More?</h2>
        <p className="text-muted-foreground mb-6">
          We'd love to hear from you. Reach out with questions, feedback, or just to say hello!
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-3 text-base"
        >
          Contact Us
        </a>
      </section>
    </div>
    </>
  );
}
