'use client';

import Link from 'next/link';
import { Tag, Package, Grid3x3 } from 'lucide-react';
import { memo, useMemo } from 'react';
import Button from '@/components/ui/Button';
import type { Category } from '@/types';

interface CategoryWithCount extends Category {
  productCount: number;
}

interface CategoryCardProps {
  category: CategoryWithCount;
}

const CategoryCard = memo(function CategoryCard({ category }: CategoryCardProps) {
  // Memoize category icon to avoid recalculation on every render
  const categoryIcon = useMemo(() => {
    if (category.icon) {
      return (
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-3xl" aria-hidden="true">{category.icon}</span>
        </div>
      );
    }

    // Default icon based on category name
    const name = category.name.toLowerCase();
    if (name.includes('book') || name.includes('textbook')) {
      return (
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
          <Tag className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
      );
    }
    if (name.includes('electronic') || name.includes('phone') || name.includes('laptop')) {
      return (
        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" aria-hidden="true" />
        </div>
      );
    }
    if (name.includes('cloth') || name.includes('fashion') || name.includes('wear')) {
      return (
        <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
          <Grid3x3 className="h-8 w-8 text-pink-600 dark:text-pink-400" aria-hidden="true" />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Tag className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
    );
  }, [category.icon, category.name]);

  // Memoize product count text
  const productCountText = useMemo(() => {
    return `${category.productCount || 0} ${category.productCount === 1 ? 'product' : 'products'}`;
  }, [category.productCount]);

  const categoryDescription = category.description || `Browse ${category.name} products`;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
      aria-label={`Browse ${category.name} category with ${productCountText}. ${categoryDescription}`}
    >
      <article className="rounded-lg border bg-card p-6 hover:shadow-lg hover:border-primary transition-all h-full">
        {/* Icon */}
        <div className="flex justify-center">
          {categoryIcon}
        </div>

        {/* Category Name */}
        <h3 className="text-xl font-semibold text-center mb-2 group-hover:text-primary transition-colors" id={`category-${category._id}-name`}>
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2" aria-labelledby={`category-${category._id}-name`}>
            {category.description}
          </p>
        )}

        {/* Product Count */}
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground" aria-label={`${productCountText} available`}>
          <Package className="h-4 w-4" aria-hidden="true" />
          <span>{productCountText}</span>
        </div>

        {/* View Button */}
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full" aria-label={`View all products in ${category.name}`}>
            View Products
          </Button>
        </div>
      </article>
    </Link>
  );
});

export default CategoryCard;
