'use client';

import Image from 'next/image';
import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { DEFAULT_BLUR_DATA_URL, IMAGE_SIZES } from '@/lib/imageUtils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  priority?: boolean;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

// Static size mappings - moved outside component
const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
} as const;

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
} as const;

/**
 * Avatar component for user profile pictures with fallback and online status
 *
 * @example
 * <Avatar
 *   src={user.avatar}
 *   alt={user.name}
 *   size="md"
 *   showOnlineStatus
 *   isOnline={user.isOnline}
 * />
 */
const Avatar = memo(function Avatar({
  src,
  alt,
  size = 'md',
  className,
  priority = false,
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Memoize size classes to avoid recalculation
  const { sizeClass, customSize } = useMemo(() => {
    return {
      sizeClass: typeof size === 'number' ? '' : SIZE_CLASSES[size],
      customSize: typeof size === 'number' ? { width: size, height: size } : {},
    };
  }, [size]);

  // Memoize image sizes attribute
  const imageSizes = useMemo(() => {
    return IMAGE_SIZES.avatar;
  }, []);

  // Stable error handler with useCallback
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Memoize initials calculation
  const initials = useMemo(() => {
    const parts = alt.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return alt[0].toUpperCase();
  }, [alt]);

  // Memoize online status color
  const onlineStatusColor = useMemo(() => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  }, [isOnline]);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0',
        sizeClass,
        className
      )}
      style={customSize}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={imageSizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-primary font-semibold">
          {initials || <User className="h-1/2 w-1/2" />}
        </div>
      )}

      {/* Online status indicator */}
      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full transition-colors',
            onlineStatusColor
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
});

export default Avatar;
