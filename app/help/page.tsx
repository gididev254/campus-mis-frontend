import { Metadata } from 'next';
import { Search, BookOpen, ShoppingCart, User, Shield, CreditCard, Package, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Help Center',
  description: 'Get help using Embuni Campus Market. Find guides, tutorials, and answers to common questions.',
  keywords: ['help center', 'support', 'guides', 'tutorials', 'campus market help'],
  canonical: '/help',
});

export default function HelpPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Help', url: '/help' },
  ]);
  const helpTopics = [
    {
      title: 'Getting Started',
      description: 'Learn how to create an account and start buying or selling',
      icon: BookOpen,
      articles: [
        { title: 'How to create an account', href: '/faq' },
        { title: 'Setting up your profile', href: '/faq' },
        { title: 'Understanding user roles', href: '/faq' },
      ],
    },
    {
      title: 'Buying',
      description: 'Everything you need to know about purchasing products',
      icon: ShoppingCart,
      articles: [
        { title: 'How to search for products', href: '/faq' },
        { title: 'Adding items to cart', href: '/faq' },
        { title: 'Checkout process', href: '/faq' },
        { title: 'Payment with M-Pesa', href: '/faq' },
        { title: 'Tracking your order', href: '/faq' },
      ],
    },
    {
      title: 'Selling',
      description: 'Learn how to list and sell your products',
      icon: Package,
      articles: [
        { title: 'Creating a product listing', href: '/faq' },
        { title: 'Product guidelines', href: '/faq' },
        { title: 'Managing your inventory', href: '/faq' },
        { title: 'Handling orders', href: '/faq' },
        { title: 'Receiving payments', href: '/faq' },
      ],
    },
    {
      title: 'Account & Security',
      description: 'Manage your account and stay safe',
      icon: Shield,
      articles: [
        { title: 'Updating your profile', href: '/faq' },
        { title: 'Changing your password', href: '/faq' },
        { title: 'Account verification', href: '/faq' },
        { title: 'Privacy settings', href: '/faq' },
      ],
    },
    {
      title: 'Payments',
      description: 'Understanding payments and refunds',
      icon: CreditCard,
      articles: [
        { title: 'M-Pesa integration', href: '/faq' },
        { title: 'Seller payouts', href: '/faq' },
        { title: 'Refund policy', href: '/faq' },
        { title: 'Payment issues', href: '/faq' },
      ],
    },
    {
      title: 'Communications',
      description: 'Messaging and seller interactions',
      icon: MessageSquare,
      articles: [
        { title: 'Sending messages', href: '/faq' },
        { title: 'Contacting sellers', href: '/faq' },
        { title: 'Report an issue', href: '/contact' },
      ],
    },
  ];

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Help <span className="text-primary">Center</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Find answers, guides, and support to help you make the most of Embuni Campus Market
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">Quick Start Guide</h3>
              <p className="text-sm text-muted-foreground mb-3">Get started in minutes</p>
              <Link href="/faq" className="text-sm text-primary hover:underline">
                Learn more →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">FAQs</h3>
              <p className="text-sm text-muted-foreground mb-3">Frequently asked questions</p>
              <Link href="/faq" className="text-sm text-primary hover:underline">
                View FAQs →
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-1">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-3">Can't find what you need?</p>
              <Link href="/contact" className="text-sm text-primary hover:underline">
                Get in touch →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Help Topics */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Browse by Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card key={topic.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Popular FAQs */}
      <section className="mb-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Popular Questions</CardTitle>
            <CardDescription>Most commonly asked questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <Link href="/faq" className="font-medium hover:text-primary transition-colors">
                How do I create an account?
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Learn about the registration process and account setup
              </p>
            </div>

            <div className="border-b pb-4">
              <Link href="/faq" className="font-medium hover:text-primary transition-colors">
                How does M-Pesa payment work?
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Understand our secure payment integration
              </p>
            </div>

            <div className="border-b pb-4">
              <Link href="/faq" className="font-medium hover:text-primary transition-colors">
                How do I list a product for sale?
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Step-by-step guide to creating product listings
              </p>
            </div>

            <div>
              <Link href="/faq" className="font-medium hover:text-primary transition-colors">
                What happens after I place an order?
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Order confirmation, payment, and delivery process
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Still Need Help */}
      <section className="text-center bg-muted/50 rounded-lg p-12">
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Can't find what you're looking for? Our support team is here to help you with any questions or issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-3"
          >
            Contact Support
          </a>
          <a
            href="/faq"
            className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-border hover:bg-accent px-6 py-3"
          >
            View All FAQs
          </a>
        </div>
      </section>
    </div>
    </>
  );
}
