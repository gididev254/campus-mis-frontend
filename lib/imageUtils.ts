/**
 * Image utility functions for blur placeholder generation and optimization
 */

/**
 * Generates a tiny blur data URL for placeholder
 * This creates a minimal base64 image that serves as a blur placeholder
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Create a minimal SVG for blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generates a blur placeholder for Cloudinary images
 * Adds quality reduction and blur transformations
 */
export function generateCloudinaryBlurDataURL(url: string): string | undefined {
  if (!url || !url.includes('cloudinary.com')) {
    return undefined;
  }

  try {
    // Add transformation for blur placeholder: quality 1, blur 50
    const blurUrl = url.replace(
      /\/upload\//,
      '/upload/q_1,bl_50,w_10,h_10,c_scale/'
    );
    return blurUrl;
  } catch (error) {
    console.error('Error generating Cloudinary blur URL:', error);
    return undefined;
  }
}

/**
 * Generates a colored blur placeholder based on a color
 */
export function generateColoredBlurDataURL(
  color: string = '#e5e7eb',
  width: number = 10,
  height: number = 10
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Default blur data URL for images
 */
export const DEFAULT_BLUR_DATA_URL = generateBlurDataURL();

/**
 * Responsive sizes for different image contexts
 */
export const IMAGE_SIZES = {
  avatar: '(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px',
  thumbnail: '(max-width: 640px) 80px, 100px',
  productCard: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  productDetail: '(max-width: 1024px) 100vw, 50vw',
  hero: '100vw',
  banner: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px',
} as const;

/**
 * Calculate aspect ratio for images
 */
export function getAspectRatioDimensions(
  aspectRatio: 'square' | 'video' | 'portrait' | 'landscape' | number,
  baseSize: number
): { width: number; height: number } {
  if (typeof aspectRatio === 'number') {
    const width = baseSize;
    const height = Math.round(baseSize / aspectRatio);
    return { width, height };
  }

  switch (aspectRatio) {
    case 'square':
      return { width: baseSize, height: baseSize };
    case 'video':
      return { width: baseSize, height: Math.round(baseSize * (9 / 16)) };
    case 'portrait':
      return { width: baseSize, height: Math.round(baseSize * (4 / 3)) };
    case 'landscape':
      return { width: baseSize, height: Math.round(baseSize * (3 / 4)) };
    default:
      return { width: baseSize, height: baseSize };
  }
}

/**
 * Get image quality based on connection type (simple implementation)
 */
export function getImageQuality(defaultQuality: number = 85): number {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.saveData) {
      return 60; // Lower quality for data saving mode
    }
    if (conn && conn.effectiveType) {
      const effectiveType = conn.effectiveType;
      if (effectiveType === '2g') {
        return 60;
      } else if (effectiveType === '3g') {
        return 75;
      }
    }
  }
  return defaultQuality;
}

/**
 * Generate blur hash colors for different image types
 */
export const BLUR_COLORS = {
  product: '#f3f4f6',
  avatar: '#e5e7eb',
  banner: '#d1d5db',
  default: '#e5e7eb',
} as const;
