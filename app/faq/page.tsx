import { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import { generateMetadata, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'FAQ',
  description: 'Find quick answers to common questions about using Embuni Campus Market. Learn about buying, selling, payments, and more.',
  keywords: ['faq', 'help', 'support', 'questions', 'campus marketplace', 'how to'],
  canonical: '/faq',
});

export default function FAQPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'To create an account, click the "Register" button in the top right corner. Fill in your name, email, phone number, and create a password. You can also select whether you want to register as a buyer, seller, or both. After submitting, you\'ll receive a confirmation email.',
        },
        {
          q: 'Is Embuni Campus Market free to use?',
          a: 'Yes! Creating an account and browsing products is completely free. Sellers can list products without any upfront fees. A small transaction fee applies only when a sale is successfully completed.',
        },
        {
          q: 'What are the different user roles?',
          a: 'We have three user roles: Buyers can purchase products, Sellers can list and sell products, and Admins manage the platform. You can register as both a buyer and seller to enjoy all features.',
        },
      ],
    },
    {
      category: 'Buying & Orders',
      questions: [
        {
          q: 'How do I search for products?',
          a: 'Use the search bar at the top of the page to find specific products, or browse by category on the products page. You can also filter results by price, condition, and location to find exactly what you\'re looking for.',
        },
        {
          q: 'How does the cart work?',
          a: 'Click the "Add to Cart" button on any product to save it. You can continue shopping and add more items. When ready, click the cart icon to review your items and proceed to checkout.',
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We currently accept M-Pesa payments, which is integrated directly into our checkout process. Simply enter your M-Pesa phone number and follow the prompts to complete payment securely.',
        },
      ],
    },
  ];

  // Flatten FAQs for schema
  const flatFaqs = faqs.flatMap(category =>
    category.questions.map(q => ({
      question: q.q,
      answer: q.a,
    }))
  );

  const faqSchema = generateFAQSchema(flatFaqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  return (
    <>
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />
      <FAQPageClient />
    </>
  );
}
