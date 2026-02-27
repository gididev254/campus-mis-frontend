'use client';

import { memo, useCallback } from 'react';
import { Star, Trash2, AlertTriangle, User, Package, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: any;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ReviewCard = memo(function ReviewCard({
  review,
  onDelete,
  isDeleting = false,
}: ReviewCardProps) {
  // Render star rating
  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }, []);

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={isDeleting ? 'opacity-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {renderStars(review.rating)}
              <Badge variant="outline" className={getRatingColor(review.rating)}>
                {review.rating}/5
              </Badge>
            </div>

            {/* Reviewer and reviewed user */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>
                  <span className="font-medium text-foreground">{review.reviewer?.name}</span> reviewed{' '}
                  <span className="font-medium text-foreground">{review.reviewedUser?.name}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center space-x-1"
          >
            {isDeleting ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Product info */}
        {review.product && (
          <div className="mb-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{review.product?.title || 'Unknown Product'}</span>
            </div>
          </div>
        )}

        {/* Review comment */}
        <div className="mb-3">
          <p className="text-sm">{review.comment || 'No comment provided'}</p>
        </div>

        {/* Warning for low ratings */}
        {review.rating <= 2 && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This review has a low rating and may need attention.
              </p>
            </div>
          </div>
        )}

        {/* Order info */}
        {review.order && (
          <div className="mt-3 text-xs text-muted-foreground">
            Order: {review.order.orderNumber}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ReviewCard;
