import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Static metadata for product pages
// Dynamic metadata is set on the client side by ProductDetailClient
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Product Details | Embuni Campus Market',
    description: 'View product details, contact sellers, and make purchases on Embuni Campus Market.',
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
