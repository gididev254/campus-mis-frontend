import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us',
  description: 'Get in touch with the Embuni Campus Market team. We\'re here to help with any questions or concerns.',
  keywords: ['contact', 'support', 'help', 'customer service', 'campus market'],
  canonical: '/contact',
});

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <ContactPageClient />
    </>
  );
}
