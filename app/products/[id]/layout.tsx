import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/StructuredData';
import { generateProductMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { productsAPI } from '@/lib/api/products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for the product page
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const response = await productsAPI.getProduct(id);
    const product = response.data.product;

    return generateProductMetadata({
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category?.name || 'Uncategorized',
      condition: product.condition,
      location: product.location,
      _id: product._id,
    });
  } catch (error) {
    console.error('Failed to generate product metadata:', error);
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const response = await productsAPI.getProduct(id);
    const product = response.data.product;

    // Generate structured data
    const productSchema = generateProductSchema({
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      condition: product.condition,
      category: product.category?.name || 'Uncategorized',
      location: product.location,
      seller: {
        _id: product.seller._id,
        name: product.seller.name || 'Campus Seller',
        averageRating: product.seller.averageRating,
      },
      createdAt: product.createdAt,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: product.title, url: `/products/${product._id}` },
    ]);

    return (
      <>
        <StructuredData data={productSchema} />
        <StructuredData data={breadcrumbSchema} />
        {children}
      </>
    );
  } catch (error) {
    notFound();
  }
}
