'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import { categoriesAPI } from '@/lib/api/categories';
import { CategoryCardSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton';
import Button from '@/components/ui/Button';
import type { Category } from '@/types';
import { toast } from '@/components/ui/Toaster';

interface CategoryWithCount extends Category {
  productCount: number;
}

export default function CategoriesPageClient() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getCategories();
      setCategories(res.data.categories.filter((cat: CategoryWithCount) => cat.isActive));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories.');
      setErrorMessage('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCategories = useMemo(() => categories, [categories]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderSkeleton showSubtitle showActions={false} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Tag className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Browse Categories</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore products by category to find exactly what you need
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Tag className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No categories available</h2>
            <p className="text-muted-foreground mb-6">
              Check back later for new categories
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeCategories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}

        {/* Browse All Products CTA */}
        {categories.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-lg border bg-muted/50">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h3>
                <p className="text-muted-foreground">
                  Browse all products to see everything available on the marketplace
                </p>
              </div>
              <Link href="/products">
                <Button size="lg">Browse All Products</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
