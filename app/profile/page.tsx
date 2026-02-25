import { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'My Profile',
  description: 'Manage your profile settings, personal information, and preferences on Embuni Campus Market',
  keywords: ['profile', 'account settings', 'user profile', 'campus market'],
  canonical: '/profile',
  noIndex: true, // Don't index user profile pages
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
