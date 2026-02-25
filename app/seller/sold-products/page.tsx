'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Calendar, TrendingUp, Filter, RotateCcw } from 'lucide-react';
import { productsAPI } from '@/lib/api/products';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Product } from '@/types';
import { toast } from '@/components/ui/Toaster';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';

export default function SoldProductsPage() {
  return (
    <ClientErrorBoundary>
      <SoldProductsPageContent />
    </ClientErrorBoundary>
  );
}

function SoldProductsPageContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [relisting, setRelisting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalSold: 0,
    totalRevenue: 0,
    avgPrice: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'seller' && user?.role !== 'admin') {
      router.push('/products');
      return;
    }

    fetchSoldProducts();
  }, [isAuthenticated, user, sortBy, sortOrder]);

  const fetchSoldProducts = async () => {
    try {
      const res = await productsAPI.getSoldProducts({ sortBy, sortOrder });
      setProducts(res.data.data || []);

      // Calculate stats
      const soldProducts = res.data.data || [];
      const totalRevenue = soldProducts.reduce((sum: number, p: Product) => sum + (p.price || 0), 0);
      const avgPrice = soldProducts.length > 0 ? totalRevenue / soldProducts.length : 0;

      setStats({
        totalSold: soldProducts.length,
        totalRevenue,
        avgPrice
      });
    } catch (error) {
      console.error('Failed to fetch sold products:', error);
        toast.error('Failed to load sold products.');
    } finally {
      setLoading(false);
    }
  };

  const handleRelist = async (productId: string) => {
    if (!confirm('Re-list this product? This will create a new active listing with the same details.')) {
      return;
    }

    setRelisting(productId);
    try {
      await productsAPI.relistProduct(productId, {});
      toast.success('Product re-listed successfully!');
      router.push('/seller/products');
    } catch (error: unknown) {
      console.error('Failed to re-list product:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to re-list product');
    } finally {
      setRelisting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sold products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold">Sold Products History</h1>
            </div>
            <Link href="/seller/products">
              <Button variant="outline">View Active Listings</Button>
            </Link>
          </div>
          <p className="text-muted-foreground mt-2">
            Track your completed sales and revenue
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sold</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalSold}</p>
              </div>
              <Package className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-primary opacity-20" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-3xl font-bold">{formatPrice(stats.avgPrice)}</p>
              </div>
              <Calendar className="h-12 w-12 text-muted opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            <option value="updatedAt-desc">Recently Sold</option>
            <option value="updatedAt-asc">Oldest Sales</option>
            <option value="price-desc">Highest Price</option>
            <option value="price-asc">Lowest Price</option>
            <option value="createdAt-desc">Recently Listed</option>
          </select>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="text-center py-16 rounded-lg border bg-muted/30">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No sold products yet</h2>
            <p className="text-muted-foreground mb-6">
              When you make sales, they'll appear here
            </p>
            <Link href="/products/new">
              <Button>List a Product</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product._id} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{product.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        SOLD
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sold Price</p>
                        <p className="font-bold text-lg text-green-600">{formatPrice(product.price)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{product.category?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Condition</p>
                        <p className="font-medium capitalize">{product.condition}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sold Date</p>
                        <p className="font-medium">{formatDate(product.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{product.views || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRelist(product._id)}
                      disabled={relisting === product._id}
                      isLoading={relisting === product._id}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Re-list
                    </Button>
                    <Link href={`/products/${product._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  {product.images?.[0] && (
                    <div className="ml-6 w-32 h-32 rounded-lg overflow-hidden border flex-shrink-0 relative">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
