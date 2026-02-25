'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { User, MapPin, Star, MessageCircle, Package, TrendingUp } from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { productsAPI } from '@/lib/api/products';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ProductGrid from '@/components/ProductGrid';
import type { User as UserType, Product, Review } from '@/types';
import { toast } from '@/components/ui/Toaster';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = params.id as string;

        // Fetch user profile
        const userRes = await usersAPI.getUserProfile(userId);
        setUser(userRes.data.user);

        // Fetch user's active products
        const productsRes = await productsAPI.getSellerProducts(userId, { limit: 8 });
        setProducts(productsRes.data.data || []);

        // Fetch user's reviews
        const reviewsRes = await usersAPI.getUserReviews(userId);
        setReviews(reviewsRes.data.reviews || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load user data.');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleContact = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/messages?userId=${params.id}`);
      return;
    }
    router.push(`/messages?userId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <User className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">This user profile does not exist</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              {user.location && (
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  {user.location}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(user.averageRating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{user.averageRating?.toFixed(1) || 'New'}</span>
                  <span className="text-muted-foreground">({user.totalReviews || 0} reviews)</span>
                </div>

                {user.role === 'seller' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span>{products.length} products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>0 sold</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={handleContact}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Seller Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-muted/30">
              <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                {user._id === localStorage.getItem('userId')
                  ? 'You haven\'t received any reviews yet'
                  : `${user.name} hasn't received any reviews yet`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-lg border bg-card p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {review.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-muted-foreground">{review.comment}</p>

                  {review.order && (
                    <Link
                      href={`/orders/${review.order}`}
                      className="inline-block mt-3 text-sm text-primary hover:underline"
                    >
                      View Order →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        {user.role === 'seller' && products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Listings ({products.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {products.length >= 8 && (
              <div className="text-center mt-6">
                <Link href={`/products?seller=${user._id}`}>
                  <Button variant="outline">View All Products</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
