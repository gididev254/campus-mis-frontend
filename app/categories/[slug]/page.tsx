import { Metadata } from 'next';
import { categoriesAPI } from '@/lib/api/categories';
import { generateCategoryMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import CategoryDetailClient from './CategoryDetailClient';

interface PageProps {
  params: { slug: string };
}

// Generate dynamic metadata for category pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await categoriesAPI.getCategories();
    const category = response.data.categories.find(
      (cat: any) => cat.slug === params.slug
    );

    if (!category) {
      return {
        title: 'Category Not Found | Embuni Campus Market',
      };
    }

    return generateCategoryMetadata({
      name: category.name,
      description: category.description,
      slug: category.slug,
    });
  } catch (error) {
    return {
      title: 'Category | Embuni Campus Market',
    };
  }
}

export default function CategoryDetailPage({ params }: PageProps) {
  return <CategoryDetailClient slug={params.slug} />;
}
