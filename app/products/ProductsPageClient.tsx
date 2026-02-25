'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { useProducts, useCategories } from '@/lib/hooks';
import { ProductCardSkeleton, PageHeaderSkeleton } from '@/components/ui/skeleton';
import Button from '@/components/ui/Button';
import type { Category } from '@/types';

export default function ProductsPageClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'title'>('createdAt');
  const [page, setPage] = useState(1);

  // Fetch categories using React Query (cached for 10 minutes)
  const { data: categoriesData } = useCategories();

  // Fetch products using React Query (cached for 5 minutes)
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    page,
    limit: 12,
    sortBy,
    category: selectedCategory || undefined,
    search: searchTerm || undefined,
  });

  // Memoize categories to only active ones
  const categories = useMemo(
    () => categoriesData?.filter((cat: Category) => cat.isActive) || [],
    [categoriesData]
  );

  // Extract product data
  const products = productsData?.data || [];
  const totalPages = productsData?.pagination?.pages || 1;
  const totalProducts = productsData?.pagination?.total || 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
  };

  // Memoized stats
  const statsText = useMemo(() => {
    return `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'} found`;
  }, [totalProducts]);

  if (loading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeaderSkeleton showSubtitle showActions={false} />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCardSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
        <p className="text-muted-foreground">{statsText}</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="title">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === '' ? 'primary' : 'outline'}
            onClick={() => handleCategoryChange('')}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              size="sm"
              variant={selectedCategory === category._id ? 'primary' : 'outline'}
              onClick={() => handleCategoryChange(category._id)}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <ProductGrid products={products} loading={loading && page > 1} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
