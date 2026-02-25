'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Tag, ArrowLeft, Package, SlidersHorizontal } from 'lucide-react';
import { categoriesAPI } from '@/lib/api/categories';
import { productsAPI } from '@/lib/api/products';
import type { Category, Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/Toaster';
import ProductCard from '@/components/ProductCard';

interface CategoryDetailClientProps {
  slug: string;
}

export default function CategoryDetailClient({ slug }: CategoryDetailClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch categories to find matching slug
        const categoriesRes = await categoriesAPI.getCategories();
        const matchedCategory = categoriesRes.data.categories.find(
          (cat: Category) => cat.slug === slug
        );

        if (!matchedCategory) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        setCategory(matchedCategory);

        // Fetch products for this category
        const productsRes = await productsAPI.getProducts({ category: matchedCategory._id });
        setProducts(productsRes.data.data || []);
      } catch (err: unknown) {
        console.error('Failed to fetch category:', err);
        toast.error('Failed to load category.');
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>

          {/* Category header skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-96 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCardSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Tag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This category does not exist'}</p>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/categories" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {category.icon && (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">{category.icon}</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Package className="h-5 w-5" />
              <span>{products.length} products</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 rounded-lg border bg-muted/30">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
            <p className="text-muted-foreground mb-6">
              There are no products in this category at the moment
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Browse More */}
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
