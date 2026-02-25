import { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Sign Up',
  description: 'Create an account and start buying and selling on Embuni Campus Market',
  keywords: ['register', 'sign up', 'create account', 'campus market', 'student marketplace'],
  canonical: '/register',
  noIndex: true, // Don't index auth pages
});

export default function RegisterPage() {
  return <RegisterPageClient />;
}
