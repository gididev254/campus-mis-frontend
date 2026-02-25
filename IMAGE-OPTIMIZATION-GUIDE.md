# Image Optimization Guide

This guide explains the image optimization implementation in the Campus Market frontend.

## Overview

The Campus Market uses Next.js built-in Image optimization with blur placeholders, loading skeletons, and responsive sizing for optimal performance and user experience.

## Key Features

### 1. Blur Placeholders
- All images use blur placeholders while loading
- Cloudinary images get optimized blur transformations
- SVG-based blur data URLs for local images
- Reduces perceived load time

### 2. Loading Skeletons
- Animated shimmer effect during image load
- Consistent loading experience across the app
- Different skeleton types: product cards, avatars, banners

### 3. Responsive Images
- Multiple sizes generated automatically
- Device-specific breakpoints
- WebP/AVIF format support
- Lazy loading by default

### 4. Adaptive Quality
- Quality adjusts based on connection type
- Data-saving mode support
- Configurable quality per image

## Components

### ProductImage Component

Specialized component for product images with Cloudinary optimization.

```tsx
<ProductImage
  src={product.images[0]}
  alt={product.title}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={false}
  showSkeleton={true}
/>
```

**Props:**
- `src`: Image URL (Cloudinary or local)
- `alt`: Alt text for accessibility
- `fill`: Use fill layout (for containers)
- `width/height`: Fixed dimensions
- `priority`: Load immediately (above-fold images)
- `sizes`: Responsive sizes
- `showSkeleton`: Show loading skeleton
- `showFallback`: Show fallback on error
- `blurColor`: Custom blur placeholder color

### OptimizedImage Component

General-purpose optimized image component.

```tsx
<OptimizedImage
  src="/banner.jpg"
  alt="Sale banner"
  width={1920}
  height={1080}
  priority
  aspectRatio="landscape"
  showSkeleton
  useCloudinaryBlur
/>
```

**Props:**
- All ProductImage props, plus:
- `aspectRatio`: 'square' | 'video' | 'portrait' | 'landscape' | number
- `objectFit`: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
- `useCloudinaryBlur`: Generate Cloudinary blur URL
- `quality`: Custom quality (1-100)

### Avatar Component

Optimized avatar with fallback and online status.

```tsx
<Avatar
  src={user.avatar}
  alt={user.name}
  size="md"
  showOnlineStatus
  isOnline={user.isOnline}
/>
```

**Props:**
- `src`: Avatar URL
- `alt`: User name
- `size`: 'sm' | 'md' | 'lg' | 'xl' | number
- `showOnlineStatus`: Show online indicator
- `isOnline`: Online status
- `priority`: Load immediately

### ImageSkeleton Component

Loading skeleton for images.

```tsx
<ImageSkeleton aspectRatio="square" />
```

**Variants:**
- `ProductCardSkeleton`: Product card loading state
- `ProductGridSkeleton`: Grid of product skeletons
- `AvatarSkeleton`: Avatar loading state
- `BannerSkeleton`: Banner loading state

## Utility Functions

### imageUtils.ts

Located at `/lib/imageUtils.ts`

```typescript
// Generate blur data URL
generateBlurDataURL(width, height)

// Generate Cloudinary blur URL
generateCloudinaryBlurDataURL(url)

// Generate colored blur URL
generateColoredBlurDataURL(color, width, height)

// Get responsive sizes
IMAGE_SIZES.avatar
IMAGE_SIZES.productCard
IMAGE_SIZES.productDetail
IMAGE_SIZES.hero

// Calculate aspect ratio dimensions
getAspectRatioDimensions(aspectRatio, baseSize)

// Get adaptive quality
getImageQuality(defaultQuality)
```

## Configuration

### next.config.js

Image optimization is configured in `next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
  ],
  placeholder: 'blur',
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 31536000, // 1 year
  quality: 85,
}
```

## Best Practices

### 1. Use Proper Sizes

Always provide appropriate `sizes` for responsive images:

```tsx
// Product card
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// Thumbnail
<ProductImage
  src={product.image}
  alt={product.title}
  width={80}
  height={80}
  sizes="80px"
/>
```

### 2. Priority Loading

Mark above-fold images as priority:

```tsx
<ProductImage
  src={heroImage}
  alt="Hero banner"
  fill
  priority  // Above-fold content
/>
```

### 3. Use Fill for Containers

When image fills a container:

```tsx
<div className="relative aspect-square">
  <ProductImage
    src={product.image}
    alt={product.title}
    fill
    className="object-cover"
  />
</div>
```

### 4. Provide Alt Text

Always provide descriptive alt text:

```tsx
// Good
<ProductImage
  src={product.image}
  alt="Blue denim jacket, size medium"
  fill
/>

// Bad
<ProductImage
  src={product.image}
  alt="image"
  fill
/>
```

### 5. Handle Errors

Provide fallback UI:

```tsx
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  showFallback={true}
  fallbackText="Image not available"
/>
```

## Performance Benefits

### 1. Reduced Bandwidth
- WebP/AVIF formats: 30-50% smaller than JPEG/PNG
- Adaptive quality based on connection
- Responsive sizes prevent over-delivery

### 2. Faster Loading
- Blur placeholders reduce perceived load time
- Lazy loading below-fold images
- Priority loading for above-fold content
- Browser caching with 1-year TTL

### 3. Better UX
- Smooth fade-in transitions
- Loading skeletons
- No layout shift
- Consistent loading experience

## Troubleshooting

### Images Not Loading

1. Check Next.js config for remote patterns
2. Verify image URLs are accessible
3. Check browser console for errors
4. Ensure proper dimensions or fill prop

### Blur Not Working

1. Ensure `placeholder: 'blur'` is set
2. Check blurDataURL is provided
3. Verify Next.js image optimization is enabled

### Layout Shift

1. Use aspect ratio containers
2. Provide width/height for fixed images
3. Use fill prop for container-based images

### Slow Loading

1. Check image file sizes
2. Verify Cloudinary transformations
3. Use priority for above-fold images
4. Enable lazy loading for below-fold

## Examples

### Product Card Image

```tsx
<div className="relative aspect-square overflow-hidden">
  <ProductImage
    src={product.images?.[0]}
    alt={`Product image of ${product.title}`}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

### Hero Banner

```tsx
<div className="relative aspect-video">
  <OptimizedImage
    src="/hero-banner.jpg"
    alt="Summer sale - up to 50% off"
    fill
    priority
    sizes="100vw"
    aspectRatio="video"
    showSkeleton
  />
</div>
```

### User Avatar

```tsx
<Avatar
  src={user.avatar}
  alt={user.name}
  size="md"
  showOnlineStatus
  isOnline={user.isOnline}
/>
```

### Thumbnail Gallery

```tsx
<div className="grid grid-cols-4 gap-2">
  {images.map((img) => (
    <button key={img} className="relative aspect-square">
      <ProductImage
        src={img}
        alt={`Thumbnail ${index + 1}`}
        fill
        sizes="80px"
      />
    </button>
  ))}
</div>
```

## Migration Guide

### From <img> to Next.js Image

Before:
```tsx
<img src={product.image} alt={product.title} className="w-full h-full object-cover" />
```

After:
```tsx
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  className="object-cover"
/>
```

### Adding Blur Placeholder

Before:
```tsx
<Image src={product.image} alt={product.title} fill />
```

After:
```tsx
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  showSkeleton
/>
```

## Further Reading

- [Next.js Image Component](https://nextjs.org/docs/api-reference/next/image)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [WebP Support](https://caniuse.com/webp)
- [AVIF Support](https://caniuse.com/avif)
