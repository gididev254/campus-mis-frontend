import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component with proper dark mode support
 */
const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton for product cards in grid layouts
 */
interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          {/* Image skeleton */}
          <div className="aspect-square w-full bg-muted animate-pulse" />

          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4" />

            {/* Price and location skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>

            {/* Action button skeleton */}
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for category cards
 */
interface CategoryCardSkeletonProps {
  count?: number;
}

export const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          {/* Icon skeleton */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          </div>

          {/* Category name skeleton */}
          <Skeleton className="h-6 w-3/4 mx-auto mb-3" />

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mx-auto" />
          </div>

          {/* Product count skeleton */}
          <div className="flex items-center justify-center mb-4">
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for table rows
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  showAvatar = false,
}) => {
  return (
    <div className="space-y-3">
      {/* Table header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>

      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4 border-b">
          {showAvatar && (
            <div className="flex-shrink-0">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          )}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for profile page
 */
interface ProfileSkeletonProps {
  showAvatar?: boolean;
  showStats?: boolean;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({
  showAvatar = true,
  showStats = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-6">
          {/* Avatar skeleton */}
          {showAvatar && (
            <div>
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
          )}

          {/* User info skeleton */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Stats section */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for order cards in list view
 */
interface OrderListSkeletonProps {
  count?: number;
}

export const OrderListSkeleton: React.FC<OrderListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex gap-4">
            {/* Product image skeleton */}
            <div className="w-20 h-20 rounded-lg bg-muted animate-pulse flex-shrink-0" />

            {/* Order details skeleton */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>

              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for individual order card (matches OrderCard component layout)
 */
interface OrderCardSkeletonProps {
  count?: number;
}

export const OrderCardSkeleton: React.FC<OrderCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="block rounded-lg border bg-card p-6 hover:border-primary transition-colors">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-20 h-20 rounded-lg bg-muted animate-pulse flex-shrink-0" />

            {/* Order Details */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title and status */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-6 bg-muted rounded-full w-16 animate-pulse flex-shrink-0 ml-2" />
              </div>

              {/* Payment status and price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </div>
                <div className="h-6 bg-muted rounded w-20 animate-pulse" />
              </div>

              {/* Date */}
              <div className="h-3 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for order detail view
 */
export const OrderDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>

      {/* Order info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Product details */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex gap-6">
          <Skeleton className="w-32 h-32 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

/**
 * Skeleton for product detail page
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-16" />
          </div>

          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Seller info skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for admin/product management pages with horizontal cards
 */
interface ProductCardHorizontalSkeletonProps {
  count?: number;
}

export const ProductCardHorizontalSkeleton: React.FC<ProductCardHorizontalSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image skeleton */}
            <div className="w-full md:w-48 h-48 bg-muted animate-pulse flex-shrink-0" />

            {/* Details skeleton */}
            <div className="flex-1 p-6 space-y-3">
              {/* Title and badges */}
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 md:w-48">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for stats cards (dashboard style)
 */
interface StatsCardsSkeletonProps {
  count?: number;
}

export const StatsCardsSkeleton: React.FC<StatsCardsSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for page headers
 */
interface PageHeaderSkeletonProps {
  showSubtitle?: boolean;
  showActions?: boolean;
}

export const PageHeaderSkeleton: React.FC<PageHeaderSkeletonProps> = ({
  showSubtitle = true,
  showActions = true,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          {showSubtitle && <Skeleton className="h-4 w-96" />}
        </div>
        {showActions && <Skeleton className="h-10 w-32" />}
      </div>
    </div>
  );
};

/**
 * Skeleton for messages/conversations
 */
interface MessageListSkeletonProps {
  count?: number;
}

export const MessageListSkeleton: React.FC<MessageListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for individual message card (matches MessageCard component layout)
 */
interface MessageCardSkeletonProps {
  count?: number;
}

export const MessageCardSkeleton: React.FC<MessageCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-full bg-muted animate-pulse flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Name and date row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-12 animate-pulse" />
                </div>
                <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              </div>

              {/* Message preview */}
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
            </div>

            {/* Unread badge placeholder */}
            <div className="flex-shrink-0 w-6 h-6" />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Skeleton for cart items
 */
interface CartItemSkeletonProps {
  count?: number;
}

export const CartItemSkeleton: React.FC<CartItemSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border bg-card p-4">
          {/* Image */}
          <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

          {/* Details */}
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for notifications list
 */
interface NotificationListSkeletonProps {
  count?: number;
}

export const NotificationListSkeleton: React.FC<NotificationListSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start space-x-4">
            {/* Icon skeleton */}
            <div className="w-5 h-5 bg-muted rounded animate-pulse flex-shrink-0 mt-1" />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                  </div>
                </div>
                {/* Actions skeleton */}
                <div className="flex items-center space-x-1">
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for individual notification card
 */
interface NotificationCardSkeletonProps {
  count?: number;
}

export const NotificationCardSkeleton: React.FC<NotificationCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="w-5 h-5 bg-muted rounded animate-pulse flex-shrink-0 mt-1" />

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-full animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Skeleton;
