'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import { ordersAPI } from '@/lib/api/orders';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types';
import { OrderListSkeleton } from '@/components/ui/skeleton';
import OrderCard from '@/components/OrderCard';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';

export default function OrdersPage() {
  return (
    <ClientErrorBoundary>
      <OrdersPageContent />
    </ClientErrorBoundary>
  );
}

function OrdersPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await ordersAPI.getOrders({ as: 'buyer' });
      setOrders(res.data.data || []);
    } catch (error: unknown) {
      console.error('Failed to fetch orders:', error);
        toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, router, fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((order: Order) => order.status === filter);
  }, [orders, filter]);

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            </div>
          </div>

          {/* Orders skeleton */}
          <OrderListSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange('confirmed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'confirmed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => handleFilterChange('shipped')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'shipped'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => handleFilterChange('delivered')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'delivered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `You don't have any ${filter} orders`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
