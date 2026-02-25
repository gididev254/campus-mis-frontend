import { Metadata } from 'next';
import LoginPageClient from './LoginPageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Sign In',
  description: 'Sign in to your account to buy and sell on Embuni Campus Market',
  keywords: ['login', 'sign in', 'campus market', 'student account'],
  canonical: '/login',
  noIndex: true, // Don't index auth pages
});

export default function LoginPage() {
  return <LoginPageClient />;
}
