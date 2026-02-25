import { Metadata } from 'next';
import { productsAPI } from '@/lib/api/products';
import { generateProductMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: { id: string };
}

// Generate dynamic metadata for product pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await productsAPI.getProduct(params.id);
    const product = response.data.product;

    return generateProductMetadata({
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category.name,
      condition: product.condition,
      location: product.location,
      _id: product._id,
    });
  } catch (error) {
    // Fallback metadata if product not found
    return {
      title: 'Product Not Found | Embuni Campus Market',
      description: 'The requested product could not be found.',
    };
  }
}

export default function ProductDetailPage({ params }: PageProps) {
  return <ProductDetailClient productId={params.id} />;
}
