import ProductCard from './ProductCard';
import type { Product } from '@/types';
import { ProductCardSkeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

/**
 * ProductGrid - A reusable grid layout for displaying products
 * Handles loading states and responsive grid columns
 */
const ProductGrid = memo(function ProductGrid({
  products,
  loading = false,
  columns = { sm: 1, md: 2, lg: 4, xl: 4 },
  className
}: ProductGridProps) {
  // Memoize grid classes to prevent recalculation
  const gridClass = useMemo(() => cn(
    'grid gap-6',
    `grid-cols-${columns.sm || 1}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  ), [columns, className]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  // Product grid
  return (
    <div className={gridClass}>
      {products.filter(Boolean).map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
});

export default ProductGrid;
