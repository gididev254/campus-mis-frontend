import { Metadata } from 'next';

/**
 * SEO configuration and utilities
 */

export const SITE_CONFIG = {
  name: 'Embuni Campus Market',
  title: 'Embuni Campus Market - Buy & Sell on Campus',
  description: 'Your trusted campus marketplace. Buy and sell products, textbooks, electronics, and more within your campus community.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://embuni-campus-market.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/embunimarket',
    facebook: 'https://facebook.com/embunimarket',
    instagram: 'https://instagram.com/embunimarket',
  },
  contact: {
    email: 'support@embuni-campus-market.com',
    phone: '+254 XXX XXX XXX',
  },
  address: {
    streetAddress: 'University Campus',
    addressLocality: 'Embu',
    addressCountry: 'KE',
  },
} as const;

/**
 * Generate default metadata with OpenGraph and Twitter cards
 */
export function generateMetadata(options: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'product';
}): Metadata {
  const {
    title = SITE_CONFIG.title,
    description = SITE_CONFIG.description,
    image = SITE_CONFIG.ogImage,
    keywords,
    canonical,
    noIndex = false,
    type = 'website',
  } = options;

  const fullTitle = title === SITE_CONFIG.title ? title : `${title} | ${SITE_CONFIG.name}`;
  const url = canonical ? new URL(canonical, SITE_CONFIG.url).href : SITE_CONFIG.url;
  const imageUrl = new URL(image, SITE_CONFIG.url).href;

  return {
    title: fullTitle,
    description,
    keywords: keywords || [
      'campus marketplace',
      'buy and sell',
      'embuni',
      'university market',
      'student marketplace',
      'campus shopping',
      'textbooks',
      'electronics',
      'M-Pesa payments',
    ],
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,

    openGraph: {
      type: type === 'product' ? 'website' : type,
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@embunimarket',
      site: '@embunimarket',
    },

    alternates: {
      canonical: url,
    },

    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    verification: {
      // Add your verification codes here
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };
}

/**
 * Generate product metadata
 */
export function generateProductMetadata(product: {
  title: string;
  description: string;
  price: number;
  images?: string[];
  category: string;
  condition: string;
  location: string;
  _id: string;
}): Metadata {
  const imageUrl = product.images?.[0] || '/og-image.png';
  const canonical = `/products/${product._id}`;

  return generateMetadata({
    title: product.title,
    description: product.description.slice(0, 160),
    image: imageUrl,
    keywords: [
      product.title,
      product.category,
      product.condition,
      product.location,
      'campus',
      'secondhand',
      'used',
    ],
    canonical,
    type: 'product',
  });
}

/**
 * Generate category metadata
 */
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  slug: string;
}): Metadata {
  const description = category.description ||
    `Browse ${category.name} listings on Embuni Campus Market. Find great deals from sellers across campus.`;

  return generateMetadata({
    title: category.name,
    description,
    keywords: [category.name, 'campus', 'marketplace', 'buy', 'sell'],
    canonical: `/categories/${category.slug}`,
  });
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.svg`,
    description: SITE_CONFIG.description,
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.contact.phone,
      contactType: 'customer service',
      email: SITE_CONFIG.contact.email,
    },
    sameAs: Object.values(SITE_CONFIG.links),
  };
}

/**
 * Generate JSON-LD structured data for Product
 */
export function generateProductSchema(product: {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  condition: string;
  category: string;
  location: string;
  seller: {
    _id: string;
    name: string;
    averageRating?: number;
  };
  createdAt: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product._id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KES',
      availability: 'https://schema.org/InStock',
      url: `${SITE_CONFIG.url}/products/${product._id}`,
      seller: {
        '@type': 'Organization',
        name: product.seller.name || 'Campus Seller',
      },
      itemCondition: product.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    },
    category: product.category,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Location',
        value: product.location,
      },
    ],
    aggregateRating: product.seller.averageRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.seller.averageRating,
          bestRating: '5',
        }
      : undefined,
  };
}

/**
 * Generate JSON-LD structured data for Breadcrumb
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.url, SITE_CONFIG.url).href,
    })),
  };
}

/**
 * Generate JSON-LD structured data for WebSite
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/products?search={search_term_string}`,
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for FAQPage
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
