import { Metadata } from 'next';
import CategoriesPageClient from './CategoriesPageClient';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Categories',
  description: 'Browse products by category. Find textbooks, electronics, fashion, and more on Embuni Campus Market.',
  keywords: ['categories', 'browse by category', 'campus products', 'student marketplace'],
  canonical: '/categories',
});

export default function CategoriesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <CategoriesPageClient />
    </>
  );
}
