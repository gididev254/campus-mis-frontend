'use client';

import { cn } from '@/lib/utils';

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  width?: number | string;
  height?: number | string;
}

/**
 * ImageSkeleton component for loading states
 *
 * Provides a consistent loading animation for images
 *
 * @example
 * // With aspect ratio
 * <ImageSkeleton aspectRatio="square" />
 *
 * @example
 * // With custom dimensions
 * <ImageSkeleton width={300} height={200} />
 *
 * @example
 * // With custom class
 * <ImageSkeleton className="w-full h-64 rounded-lg" />
 */
export default function ImageSkeleton({
  className,
  aspectRatio,
  width,
  height,
}: ImageSkeletonProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const aspectRatioClass = aspectRatio ? aspectRatioClasses[aspectRatio] : '';

  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded-lg overflow-hidden relative',
        aspectRatioClass,
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
    </div>
  );
}

/**
 * Skeleton for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Image skeleton */}
      <ImageSkeleton aspectRatio="square" className="w-full" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        </div>
        <div className="h-9 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Skeleton for product images in grid
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar images
 */
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded-full',
        sizeClasses[size]
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for banner/hero images
 */
export function BannerSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded-lg overflow-hidden relative', height)} aria-hidden="true">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
    </div>
  );
}
