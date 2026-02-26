import { MetadataRoute } from 'next';

// URL configuration
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://embuni-campus-market.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetch dynamic data for sitemap with timeout
async function fetchWithTimeout(url: string, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchProducts() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    }, 5000); // 5 second timeout
    if (!response.ok) return [];
    const data = await response.json();
    return data.data?.products || data.data || [];
  } catch (error) {
    // Silently fail during build time - backend may not be running
    // Sitemap will include static routes only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching products for sitemap:', error);
    }
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/categories`, {
      next: { revalidate: 86400 }, // Revalidate daily
    }, 5000); // 5 second timeout
    if (!response.ok) return [];
    const data = await response.json();
    return data.data?.categories || data.data || [];
  } catch (error) {
    // Silently fail during build time - backend may not be running
    // Sitemap will include static routes only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categories for sitemap:', error);
    }
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ];

  // Fetch dynamic data
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  // Product routes
  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/products/${product._id}`,
    lastModified: new Date(product.updatedAt || product.createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Category routes
  const categoryRoutes = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(category.updatedAt || category.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Combine all routes
  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
