import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = generateMetadata({
  title: 'Browse Products',
  description: 'Browse and discover products from sellers across campus. Find textbooks, electronics, and more at great prices.',
  keywords: ['products', 'browse', 'campus shopping', 'textbooks', 'electronics', 'student marketplace', 'buy', 'sell'],
  canonical: '/products',
});

export default function ProductsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <ProductsPageClient />
    </>
  );
}
