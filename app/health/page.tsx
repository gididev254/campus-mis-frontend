import { Metadata } from 'next';
import HealthPageClient from './HealthPageClient';

export const metadata: Metadata = {
  title: 'System Health - Embuni Campus Market',
  description: 'Real-time system health monitoring for Campus Market infrastructure',
  keywords: ['health check', 'system status', 'monitoring', 'infrastructure'],
  openGraph: {
    title: 'System Health - Embuni Campus Market',
    description: 'Real-time system health monitoring for Campus Market infrastructure',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function HealthPage() {
  return <HealthPageClient />;
}
