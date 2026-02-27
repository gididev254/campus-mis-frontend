'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState, useCallback, useMemo, memo } from 'react';
import {
  generateCloudinaryBlurDataURL,
  DEFAULT_BLUR_DATA_URL,
  BLUR_COLORS,
  generateColoredBlurDataURL,
  normalizeImageUrl,
} from '@/lib/imageUtils';
import ImageSkeleton from './ImageSkeleton';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showFallback?: boolean;
  fallbackText?: string;
  showSkeleton?: boolean;
  blurColor?: string;
}

/**
 * ProductImage component optimized for product images
 *
 * Features:
 * - Blur placeholder while loading
 * - Loading skeleton animation
 * - Fallback UI for missing images
 * - Optimized for Cloudinary URLs
 * - Responsive sizing
 * - WebP/AVIF format support
 *
 * @example
 * // Fill container (product card)
 * <ProductImage
 *   src={product.images[0]}
 *   alt={product.title}
 *   fill
 *   className="object-cover"
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 * />
 *
 * @example
 * // Fixed size (thumbnail)
 * <ProductImage
 *   src={product.images[0]}
 *   alt={product.title}
 *   width={80}
 *   height={80}
 *   priority
 * />
 *
 * @example
 * // With custom skeleton
 * <ProductImage
 *   src={product.images[0]}
 *   alt={product.title}
 *   fill
 *   showSkeleton
 * />
 */
const ProductImage = memo(function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  sizes,
  showFallback = true,
  fallbackText = 'No Image',
  showSkeleton = false,
  blurColor = BLUR_COLORS.product,
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Normalize and validate the image URL
  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src]);

  // Memoize blur placeholder to prevent recalculation
  const blurDataURL = useMemo(() => {
    if (!normalizedSrc) return DEFAULT_BLUR_DATA_URL;
    return generateCloudinaryBlurDataURL(normalizedSrc) || generateColoredBlurDataURL(blurColor);
  }, [normalizedSrc, blurColor]);

  // Memoize fallback UI
  const defaultFallback = useMemo(() => (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center text-muted-foreground text-sm',
        className
      )}
    >
      {fallbackText}
    </div>
  ), [className, fallbackText]);

  // Stable handlers
  const handleLoad = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => setHasError(true), []);

  // Memoize image props to prevent recalculation
  const imageProps = useMemo(() => ({
    src: normalizedSrc || '', // Use normalized src
    alt,
    ...(priority && { priority }),
    sizes,
    ...(fill
      ? {
          fill: true,
          className: cn(
            'object-cover transition-opacity duration-500 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          ),
        }
      : {
          width,
          height,
          className: cn(
            'object-cover transition-opacity duration-500 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          ),
        }),
    onLoad: handleLoad,
    onError: handleError,
    placeholder: 'blur' as const,
    blurDataURL: blurDataURL || DEFAULT_BLUR_DATA_URL,
  }), [normalizedSrc, alt, priority, sizes, fill, width, height, className, isLoading, handleLoad, handleError, blurDataURL]);

  if (!normalizedSrc || hasError) {
    return showFallback ? defaultFallback : null;
  }

  return (
    <>
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton className="w-full h-full" />
        </div>
      )}
      <Image {...imageProps} />
    </>
  );
});

export default ProductImage;
