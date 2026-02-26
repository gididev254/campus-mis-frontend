'use client';

import Image from 'next/image';
import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  generateCloudinaryBlurDataURL,
  DEFAULT_BLUR_DATA_URL,
  IMAGE_SIZES,
  getImageQuality,
} from '@/lib/imageUtils';
import ImageSkeleton from './ImageSkeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  fallback?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  showSkeleton?: boolean;
  useCloudinaryBlur?: boolean;
}

/**
 * OptimizedImage component with built-in error handling and loading states
 *
 * Features:
 * - Automatic blur placeholder during load
 * - Loading skeleton animation
 * - Error fallback UI
 * - Responsive sizing with predefined sizes
 * - Lazy loading by default
 * - Priority loading support for above-fold images
 * - Multiple aspect ratio presets
 * - Cloudinary blur placeholder support
 * - Adaptive quality based on connection
 * - WebP/AVIF format support
 *
 * @example
 * // Basic usage with fill
 * <OptimizedImage
 *   src="/product-image.jpg"
 *   alt="Product name"
 *   fill
 *   className="object-cover"
 * />
 *
 * @example
 * // Fixed size with priority
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero banner"
 *   width={1920}
 *   height={1080}
 *   priority
 *   aspectRatio="landscape"
 * />
 *
 * @example
 * // With skeleton and Cloudinary blur
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   fill
 *   showSkeleton
 *   useCloudinaryBlur
 * />
 *
 * @example
 * // Avatar with fallback
 * <OptimizedImage
 *   src={user.avatar}
 *   alt={user.name}
 *   width={40}
 *   height={40}
 *   fallback={<div className="w-10 h-10 bg-primary/10 rounded-full" />}
 * />
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  quality,
  blurDataURL,
  fallback,
  aspectRatio,
  objectFit = 'cover',
  showSkeleton = false,
  useCloudinaryBlur = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Memoize aspect ratio class to prevent recalculation
  const aspectRatioClass = useMemo(() => {
    if (fill && aspectRatio) {
      switch (aspectRatio) {
        case 'square':
          return 'aspect-square';
        case 'video':
          return 'aspect-video';
        case 'portrait':
          return 'aspect-[3/4]';
        case 'landscape':
          return 'aspect-[4/3]';
        default:
          if (typeof aspectRatio === 'number') {
            return `style="aspect-ratio: ${aspectRatio}"`;
          }
      }
    }
    return '';
  }, [fill, aspectRatio]);

  // Memoize blur data URL to prevent recalculation
  const finalBlurDataURL = useMemo(() => {
    const generatedBlurDataURL = useCloudinaryBlur
      ? generateCloudinaryBlurDataURL(src)
      : null;
    return blurDataURL || generatedBlurDataURL || DEFAULT_BLUR_DATA_URL;
  }, [src, blurDataURL, useCloudinaryBlur]);

  // Memoize adaptive quality to prevent recalculation
  const adaptiveQuality = useMemo(() => {
    return quality || getImageQuality(85);
  }, [quality]);

  // Memoize default fallback UI
  const defaultFallback = useMemo(() => (
    <div
      className={cn(
        'flex items-center justify-center bg-muted text-muted-foreground',
        className
      )}
    >
      <svg
        className="w-8 h-8 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  ), [className]);

  // Stable handlers
  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => setHasError(true), []);

  // Memoize image props to prevent recalculation
  const imageProps = useMemo(() => ({
    src,
    alt,
    quality: adaptiveQuality,
    priority,
    sizes,
    ...(fill
      ? {
          fill: true,
          className: cn(
            'transition-opacity duration-500 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          ),
        }
      : {
          width,
          height,
          className: cn(
            'transition-opacity duration-500 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          ),
        }),
    style: { objectFit },
    onError: handleError,
    onLoad: handleLoad,
    placeholder: 'blur' as const,
    blurDataURL: finalBlurDataURL,
  }), [src, alt, adaptiveQuality, priority, sizes, fill, width, height, className, isLoading, handleError, handleLoad, finalBlurDataURL, objectFit]);

  if (hasError) {
    return <>{fallback || defaultFallback}</>;
  }

  return (
    <div className={cn(fill ? 'relative' : '', aspectRatioClass)}>
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton className="w-full h-full" />
        </div>
      )}
      <Image {...imageProps} />
    </div>
  );
});

export default OptimizedImage;
