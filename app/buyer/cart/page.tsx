import { Metadata } from 'next';
import CartPageClient from './CartPageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Shopping Cart',
  description: 'View your shopping cart and proceed to checkout on Embuni Campus Market',
  keywords: ['cart', 'shopping cart', 'checkout', 'campus market'],
  canonical: '/buyer/cart',
  noIndex: true, // Don't index cart pages
});

export default function CartPage() {
  return <CartPageClient />;
}
