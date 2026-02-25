'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Heart, XCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { wishlistAPI } from '@/lib/api/wishlist';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';

interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export default function WishlistPage() {
  return (
    <ClientErrorBoundary>
      <WishlistPageContent />
    </ClientErrorBoundary>
  );
}

function WishlistPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      setWishlist(res.data.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
        toast.error('Failed to load wishlist. Please try again.');
      setErrorMessage('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, router, fetchWishlist]);

  const handleRemoveFromWishlist = useCallback(async (productId: string) => {
    setRemoving((prev) => new Set(prev).add(productId));
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await wishlistAPI.removeWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product._id !== productId));
      setSuccessMessage('Item removed from wishlist');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
        toast.error('Failed to remove item from wishlist.');
      setErrorMessage('Failed to remove item from wishlist');
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          </div>

          {/* Wishlist grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
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
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Wishlist */}
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save items you love by clicking the heart icon on any product
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const isRemoving = removing.has(item.product._id);

              return (
                <div
                  key={item._id}
                  className="rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-muted">
                    {item.product.images?.[0] ? (
                      <Link href={`/products/${item.product._id}`}>
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {/* Remove Button */}
                    <Button
                      onClick={() => handleRemoveFromWishlist(item.product._id)}
                      disabled={isRemoving}
                      variant="danger"
                      size="sm"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <Link href={`/products/${item.product._id}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-2">
                        {item.product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        {item.product.category?.name || 'Uncategorized'}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.product.condition === 'new'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : item.product.condition === 'like-new'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : item.product.condition === 'good'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {item.product.condition.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </p>
                      <Link href={`/products/${item.product._id}`}>
                        <Button size="sm" variant="outline">
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
