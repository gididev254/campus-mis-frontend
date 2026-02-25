import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://embuni-campus-market.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/buyer/',
          '/seller/',
          '/admin/',
          '/profile',
          '/messages',
          '/notifications',
          '/checkout',
          '/forgot-password',
          '/change-password',
          '/test-error',
          '/test-token-refresh',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
