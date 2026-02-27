'use client';

import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { memo, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
}

const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  const statusIcon = useMemo(() => {
    const iconClassName = "h-5 w-5";
    switch (order.status) {
      case 'pending':
        return <Clock className={`${iconClassName} text-yellow-500`} aria-hidden="true" />;
      case 'confirmed':
        return <CheckCircle className={`${iconClassName} text-blue-500`} aria-hidden="true" />;
      case 'shipped':
        return <Package className={`${iconClassName} text-purple-500`} aria-hidden="true" />;
      case 'delivered':
        return <CheckCircle className={`${iconClassName} text-green-500`} aria-hidden="true" />;
      case 'cancelled':
        return <XCircle className={`${iconClassName} text-red-500`} aria-hidden="true" />;
      default:
        return <Clock className={`${iconClassName} text-gray-500`} aria-hidden="true" />;
    }
  }, [order.status]);

  const statusColor = useMemo(() => {
    switch (order.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }, [order.status]);

  const paymentStatusColor = useMemo(() => {
    switch (order.paymentStatus) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }, [order.paymentStatus]);

  const formattedDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleDateString();
  }, [order.createdAt]);

  // Memoize formatted price
  const formattedPrice = useMemo(() => {
    return formatPrice(order.totalPrice);
  }, [order.totalPrice]);

  return (
    <Link
      href={`/buyer/orders/${order._id}`}
      className="block rounded-lg border bg-card p-6 hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`View order ${order.orderNumber} for ${order.product?.title || 'Unknown Product'}, status: ${order.status}, price: ${formattedPrice}`}
    >
      <article className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <ProductImage
            src={order.product?.images?.[0]}
            alt={`Product image for ${order.product?.title || 'Product'}`}
            fill
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" id={`order-${order._id}-title`}>
                {order.product?.title || 'Unknown Product'}
              </h3>
              <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
              aria-label={`Order status: ${order.status}`}
            >
              {order.status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {statusIcon}
              <p
                className={`text-sm font-medium ${paymentStatusColor}`}
                aria-label={`Payment status: ${order.paymentStatus}`}
              >
                {order.paymentStatus}
              </p>
            </div>
            <p className="text-lg font-bold text-primary" aria-labelledby={`order-${order._id}-title`}>
              {formattedPrice}
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            <time dateTime={order.createdAt} aria-label={`Order placed on ${formattedDate}`}>
              {formattedDate}
            </time>
          </p>
        </div>
      </article>
    </Link>
  );
});

export default OrderCard;
