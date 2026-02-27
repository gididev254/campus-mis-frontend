'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, Search, Trash2, Star, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import ReviewCard from '@/components/admin/ReviewCard';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';

function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: 20,
      };

      if (ratingFilter !== 'all') {
        params.rating = ratingFilter;
      }

      const response = await adminAPI.getAllReviews(params);
      setReviews(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle review deletion
  const handleDeleteReview = useCallback(async (reviewId: string) => {
    try {
      setDeletingReview(reviewId);
      await adminAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeletingReview(null);
    }
  }, [fetchReviews]);

  // Filter reviews by search query
  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews;

    const query = searchQuery.toLowerCase();
    return reviews.filter((review) => {
      return (
        review.comment?.toLowerCase().includes(query) ||
        review.reviewer?.name?.toLowerCase().includes(query) ||
        review.reviewedUser?.name?.toLowerCase().includes(query) ||
        review.product?.title?.toLowerCase().includes(query)
      );
    });
  }, [reviews, searchQuery]);

  // Review statistics
  const reviewStats = useMemo(() => {
    const stats = {
      total: total,
      averageRating: 0,
      byRating: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };

    reviews.forEach((review) => {
      const rating = review.rating;
      if (stats.byRating[rating as keyof typeof stats.byRating] !== undefined) {
        stats.byRating[rating as keyof typeof stats.byRating]++;
      }
    });

    // Calculate average rating
    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    stats.averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;

    return stats;
  }, [reviews, total]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">View and moderate all product reviews</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.total}</div>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm">
                {reviewStats.averageRating.toFixed(1)} avg rating
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reviewStats.byRating[5]}
            </div>
            <p className="text-xs text-muted-foreground">
              {reviewStats.total > 0
                ? `${((reviewStats.byRating[5] / reviewStats.total) * 100).toFixed(1)}% of total`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings (1-2)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reviewStats.byRating[1] + reviewStats.byRating[2]}
            </div>
            <p className="text-xs text-muted-foreground">
              May need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rating filter */}
            <div>
              <Label htmlFor="rating-filter">Rating</Label>
              <select
                id="rating-filter"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <Label htmlFor="search-reviews">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-reviews"
                  type="text"
                  placeholder="Search by comment, user, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onDelete={() => handleDeleteReview(review._id)}
                isDeleting={deletingReview === review._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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

export default function AdminReviews() {
  return (
    <ClientErrorBoundary>
      <AdminReviewsPage />
    </ClientErrorBoundary>
  );
}
