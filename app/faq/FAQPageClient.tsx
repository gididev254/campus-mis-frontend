'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function FAQPageClient() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

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
        {
          q: 'How can I track my order?',
          a: 'After placing an order, you can track its status in the "My Orders" section. You\'ll receive updates at every stage, from order confirmation to payment completion and delivery.',
        },
        {
          q: 'Can I cancel an order?',
          a: 'Orders can be cancelled if they haven\'t been processed yet. Go to "My Orders", find the order, and click "Cancel Order". Refunds are processed back to your M-Pesa account within 5-7 business days.',
        },
      ],
    },
    {
      category: 'Selling',
      questions: [
        {
          q: 'How do I list a product for sale?',
          a: 'Navigate to "Sell Products" and click "Add New Product". Fill in the product details including title, description, price, category, condition, and upload clear photos. Once submitted, your listing will be reviewed and published.',
        },
        {
          q: 'What can I sell on the platform?',
          a: 'You can sell textbooks, electronics, furniture, clothes, and other items that are relevant to campus life. All items must be legal, authentic, and accurately described. Prohibited items include weapons, illegal substances, and counterfeit goods.',
        },
        {
          q: 'How do I get paid for my sales?',
          a: 'When a buyer purchases your product, the payment is held securely until the order is completed. Once the buyer confirms receipt, the payment (minus a small transaction fee) is released to your registered M-Pesa account.',
        },
        {
          q: 'Can I edit or delete my product listings?',
          a: 'Yes! Go to "My Products" in your seller dashboard. You can edit product details, update prices, or delete listings that are no longer available. Changes take effect immediately.',
        },
        {
          q: 'What are the seller fees?',
          a: 'We charge a small transaction fee on each successful sale. This fee helps us maintain the platform, provide secure payments, and offer customer support. There are no listing fees or monthly charges.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure link to reset your password. The link expires after 1 hour for security.',
        },
        {
          q: 'Is my personal information safe?',
          a: 'Absolutely. We use industry-standard encryption to protect your data. Your payment information is processed securely through M-Pesa, and we never share your personal details with third parties without your consent.',
        },
        {
          q: 'How do I become a verified seller?',
          a: 'To increase trust and sales, we recommend getting verified. This typically involves providing additional identification and confirming your phone number. Verified sellers receive a badge on their profile and priority in search results.',
        },
        {
          q: 'Can I change my user role?',
          a: 'Yes, you can add seller privileges to your buyer account anytime. Go to your profile settings and select "Become a Seller" to start listing products.',
        },
      ],
    },
    {
      category: 'Payments & Refunds',
      questions: [
        {
          q: 'How does M-Pesa integration work?',
          a: 'During checkout, you\'ll enter your M-Pesa phone number. You\'ll receive an STK push on your phone to confirm payment. Once you enter your M-Pesa PIN, the payment is processed instantly and securely.',
        },
        {
          q: 'What is the refund policy?',
          a: 'Refunds are issued if: (1) the product received doesn\'t match the description, (2) the product is damaged or defective, or (3) the order is cancelled before processing. Refunds are processed to the original payment method within 5-7 business days.',
        },
        {
          q: 'How long do payments take to process?',
          a: 'M-Pesa payments are typically processed instantly. Once confirmed, the order status is updated and the seller is notified. In rare cases, it may take up to 10 minutes for payment confirmation.',
        },
        {
          q: 'Are there any transaction fees for buyers?',
          a: 'No, there are no additional fees for buyers. The price you see on the product listing is the final price you pay.',
        },
      ],
    },
    {
      category: 'Support & Policies',
      questions: [
        {
          q: 'How do I report a problem with a seller or buyer?',
          a: 'If you encounter any issues, use the contact form or send us a message through the platform. We take reports seriously and will investigate and take appropriate action, which may include warnings, account suspension, or banning.',
        },
        {
          q: 'What happens if a product doesn\'t match its description?',
          a: 'If you receive a product that doesn\'t match the description, you can initiate a return or refund request within 48 hours of delivery. We\'ll mediate the dispute to ensure a fair resolution.',
        },
        {
          q: 'Are there any item restrictions?',
          a: 'Yes, we prohibit the sale of illegal items, weapons, counterfeit goods, stolen items, and any products that violate campus policies or local laws. Violations will result in account suspension.',
        },
        {
          q: 'How can I contact customer support?',
          a: 'You can reach us through the contact form, email us at support@embunicampus.market, or use the in-app messaging feature. We typically respond within 24 hours.',
        },
      ],
    },
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const newIndex = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === newIndex ? null : newIndex);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked <span className="text-primary">Questions</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find quick answers to common questions about using Embuni Campus Market
        </p>
      </section>

      {/* FAQ Accordion */}
      <div className="max-w-4xl mx-auto space-y-8">
        {faqs.map((category, categoryIndex) => (
          <div key={category.category}>
            <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((faq, questionIndex) => {
                const index = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === index;

                return (
                  <Card key={faq.q} className="overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      className="w-full text-left"
                    >
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-base font-medium">{faq.q}</CardTitle>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </CardHeader>
                    </button>
                    {isOpen && (
                      <CardContent className="pt-0 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <section className="mt-16 text-center bg-muted/50 rounded-lg p-12">
        <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Can't find the answer you're looking for? Please reach out to our support team.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-3"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}
