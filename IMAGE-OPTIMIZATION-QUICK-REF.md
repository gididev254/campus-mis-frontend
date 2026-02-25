# Image Optimization - Quick Reference

## Components

### ProductImage
```tsx
<ProductImage
  src={product.image}
  alt={product.title}
  fill                    // or width/height
  sizes="(max-w:640px) 100vw, 50vw"  // responsive sizes
  priority={false}        // true for above-fold
  showSkeleton={true}     // show loading skeleton
  blurColor="#f3f4f6"     // custom blur color
/>
```

### OptimizedImage
```tsx
<OptimizedImage
  src="/banner.jpg"
  width={1920}
  height={1080}
  priority               // load immediately
  aspectRatio="landscape" // square|video|portrait|landscape
  showSkeleton
  useCloudinaryBlur      // generate Cloudinary blur
/>
```

### Avatar
```tsx
<Avatar
  src={user.avatar}
  alt={user.name}
  size="md"              // sm|md|lg|xl
  showOnlineStatus
  isOnline={true}
/>
```

### ImageSkeleton
```tsx
<ImageSkeleton aspectRatio="square" />
<ProductCardSkeleton />
<ProductGridSkeleton count={8} />
<AvatarSkeleton size="md" />
<BannerSkeleton height="h-64" />
```

## Utilities

```typescript
import {
  generateBlurDataURL,
  generateCloudinaryBlurDataURL,
  IMAGE_SIZES,
  getAspectRatioDimensions,
  getImageQuality,
  BLUR_COLORS
} from '@/lib/imageUtils';

// Predefined sizes
IMAGE_SIZES.avatar      // "(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px"
IMAGE_SIZES.productCard // "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
IMAGE_SIZES.productDetail // "(max-width: 1024px) 100vw, 50vw"
IMAGE_SIZES.hero        // "100vw"

// Blur colors
BLUR_COLORS.product  // "#f3f4f6"
BLUR_COLORS.avatar   // "#e5e7eb"
BLUR_COLORS.banner   // "#d1d5db"
```

## Best Practices

### 1. Always Use Proper Sizes
```tsx
// Good - responsive
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  sizes="(max-width: 640px) 100vw, 50vw, 33vw"
/>

// Bad - no sizes
<ProductImage src={product.image} alt={product.title} fill />
```

### 2. Use Aspect Ratio Containers
```tsx
// Good - prevents layout shift
<div className="relative aspect-square">
  <ProductImage src={product.image} alt={product.title} fill />
</div>

// Bad - causes layout shift
<div className="relative">
  <ProductImage src={product.image} alt={product.title} fill />
</div>
```

### 3. Priority for Above-Fold
```tsx
// Hero banner - priority
<ProductImage
  src={heroImage}
  alt="Hero"
  fill
  priority
/>

// Product grid - lazy load
<ProductImage
  src={product.image}
  alt={product.title}
  fill
/>
```

### 4. Descriptive Alt Text
```tsx
// Good
<ProductImage
  src={product.image}
  alt="Blue denim jacket, size medium, worn once"
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
```tsx
<ProductImage
  src={product.image}
  alt={product.title}
  fill
  showFallback={true}
  fallbackText="Image unavailable"
/>
```

## Common Patterns

### Product Card
```tsx
<div className="relative aspect-square overflow-hidden bg-muted">
  <ProductImage
    src={product.images?.[0]}
    alt={`Product image of ${product.title}`}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

### Thumbnail Gallery
```tsx
<button className="relative aspect-square">
  <ProductImage
    src={img}
    alt={`Thumbnail ${index}`}
    fill
    sizes="80px"
  />
</button>
```

### Hero Banner
```tsx
<div className="relative aspect-video">
  <OptimizedImage
    src="/hero.jpg"
    alt="Summer sale"
    fill
    priority
    sizes="100vw"
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

### Loading State
```tsx
{isLoading ? (
  <ProductGridSkeleton count={8} />
) : (
  <div className="grid grid-cols-4 gap-4">
    {products.map((p) => <ProductCard key={p._id} product={p} />)}
  </div>
)}
```

## Props Reference

### ProductImage Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string \| null \| undefined | - | Image URL |
| alt | string | - | Alt text (required) |
| fill | boolean | false | Use fill layout |
| width | number | - | Fixed width |
| height | number | - | Fixed height |
| priority | boolean | false | Load immediately |
| sizes | string | - | Responsive sizes |
| showSkeleton | boolean | false | Show loading skeleton |
| showFallback | boolean | true | Show error fallback |
| fallbackText | string | "No Image" | Error text |
| blurColor | string | "#f3f4f6" | Blur placeholder color |

### OptimizedImage Props
All ProductImage props, plus:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| aspectRatio | string \| number | - | Aspect ratio preset |
| objectFit | string | "cover" | Object fit property |
| quality | number | 85 | Image quality (1-100) |
| useCloudinaryBlur | boolean | true | Use Cloudinary blur URL |

### Avatar Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string \| null | - | Avatar URL |
| alt | string | - | User name (required) |
| size | string \| number | "md" | sm\|md\|lg\|xl\|number |
| priority | boolean | false | Load immediately |
| showOnlineStatus | boolean | false | Show indicator |
| isOnline | boolean | false | Online status |

## Troubleshooting

### Images Not Loading
1. Check `next.config.js` remotePatterns
2. Verify image URLs
3. Check browser console
4. Ensure dimensions or fill prop

### Blur Not Working
1. Check `placeholder: 'blur'` is set
2. Verify blurDataURL provided
3. Check Next.js optimization enabled

### Layout Shift
1. Use aspect ratio containers
2. Provide width/height
3. Use fill prop for containers

### Slow Loading
1. Check image file sizes
2. Verify Cloudinary transformations
3. Use priority for above-fold
4. Enable lazy loading

## Performance Tips

1. **Use WebP/AVIF**: Automatic with Next.js
2. **Lazy Load**: Default for non-priority images
3. **Responsive Sizes**: Prevents over-delivery
4. **Blur Placeholders**: Improves perceived performance
5. **Priority Loading**: Critical for above-fold content
6. **Caching**: 1-year TTL configured
7. **Adaptive Quality**: Reduces bandwidth on slow connections

## Configuration

`next.config.js` is already configured:
- Remote patterns for Cloudinary
- Blur placeholders enabled
- WebP/AVIF formats
- Responsive device sizes
- 1-year cache TTL
- 85% default quality

No additional configuration needed!
