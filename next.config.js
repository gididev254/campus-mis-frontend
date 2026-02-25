/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    // Use sharp for faster image optimization (installed by Next.js by default)
    formats: ['image/avif', 'image/webp'],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes to generate for different screen sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],

    // Minimum cache TTL (in seconds) for optimized images
    minimumCacheTTL: 31536000, // 1 year

    // Enable image optimization during development
    unoptimized: false,

    // Allow local images
    dangerouslyAllowSVG: true,

    // Content security policy for images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Loader configuration for Cloudinary optimization
    loader: 'default',
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },

  // Enable experimental features for better image optimization
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
