import { ReactNode } from 'react';

interface ProductLayoutProps {
  children: ReactNode;
}

// Simple layout wrapper for product detail pages
// Data fetching and structured data are handled by ProductDetailClient
export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}
