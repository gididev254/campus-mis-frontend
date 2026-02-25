import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CartProvider } from '@/contexts/CartContext'
import { QueryProvider } from '@/contexts/QueryContext'
import { Toaster } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import ConnectionToast from '@/components/ConnectionToast'
import StructuredData from '@/components/StructuredData'
import { SITE_CONFIG, generateWebSiteSchema, generateOrganizationSchema } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: '%s | ' + SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'campus marketplace',
    'buy and sell',
    'embuni',
    'university market',
    'student marketplace',
    'campus shopping',
    'textbooks',
    'electronics',
    'M-Pesa payments',
    'secondhand',
    'used items',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: '@embunimarket',
    site: '@embunimarket',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_CONFIG.name,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData data={generateWebSiteSchema()} />
        <StructuredData data={generateOrganizationSchema()} />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <CartProvider>
                    <div className="min-h-screen flex flex-col">
                      <a href="#main-content" className="skip-to-main">
                        Skip to main content
                      </a>
                      <Header />
                      <main id="main-content" className="flex-1" tabIndex={-1}>
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <ConnectionToast />
                    <Toaster
                      position="top-right"
                      expand={false}
                      richColors
                      closeButton
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'hsl(var(--background))',
                          color: 'hsl(var(--foreground))',
                          border: '1px solid hsl(var(--border))',
                        },
                      }}
                    />
                  </CartProvider>
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
