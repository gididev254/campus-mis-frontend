import { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { SITE_CONFIG, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Home',
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    type: 'website',
  },
};

export default function HomePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <HomePageClient />
    </>
  );
}
