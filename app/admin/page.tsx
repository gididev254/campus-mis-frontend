'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load the AdminDashboard component
const AdminDashboardContent = dynamic(() => import('@/components/AdminDashboard'), {
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  ),
  ssr: true,
});

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}
