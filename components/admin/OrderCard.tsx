'use client';

import { memo, useCallback } from 'react';
import { Eye, Package, User, ShoppingCart, Clock, CheckCircle, XCircle, Truck, IndianRupee, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onViewDetails: () => void;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Status badge colors
const getStatusColor = (status: string) => {
  switch (status) {
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
    case 'refunded':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Payment status badge colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'refunded':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Status icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'confirmed':
      return <CheckCircle className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    case 'refunded':
      return <RefreshCw className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const OrderCard = memo(function OrderCard({
  order,
  onViewDetails,
  onStatusUpdate,
  isExpanded = false,
  onToggleExpand,
}: OrderCardProps) {
  const handleStatusChange = useCallback(async (newStatus: string) => {
    try {
      await onStatusUpdate(order._id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, [order._id, onStatusUpdate]);

  // Get available status transitions
  const getAvailableTransitions = () => {
    const transitions: { value: string; label: string }[] = [];
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      refunded: [],
    };

    const available = validTransitions[order.status] || [];
    return available.map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    }));
  };

  return (
    <Card className={`transition-all ${isExpanded ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <Badge className={getStatusColor(order.status)}>
                <span className="flex items-center space-x-1">
                  {getStatusIcon(order.status)}
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </span>
              </Badge>
              <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Buyer: {order.buyer?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Seller: {order.seller?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Button>
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
              >
                {isExpanded ? '▲' : '▼'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Product info */}
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start space-x-3">
              {order.product?.images && order.product.images.length > 0 && (
                <img
                  src={order.product.images[0]}
                  alt={order.product?.title || 'Product'}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{order.product?.title || 'Unknown Product'}</h4>
                <p className="text-sm text-muted-foreground">
                  Quantity: {order.quantity} × {formatPrice(order.product?.price || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatPrice(order.totalPrice)}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-2">Payment Information</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Method:</span>{' '}
                <span className="font-medium">{order.paymentMethod?.toUpperCase() || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{' '}
                <span className="font-medium">{order.mpesaPhoneNumber || 'N/A'}</span>
              </div>
              {order.mpesaTransactionId && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Transaction ID:</span>{' '}
                  <span className="font-medium">{order.mpesaTransactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Shipping Address</h5>
              <p className="text-sm">
                {order.shippingAddress.street && <>{order.shippingAddress.street}, </>}
                {order.shippingAddress.building && <>{order.shippingAddress.building}, </>}
                {order.shippingAddress.room && <>Room {order.shippingAddress.room}</>}
                {order.shippingAddress.city && <>, {order.shippingAddress.city}</>}
                {order.shippingAddress.landmarks && <> (near {order.shippingAddress.landmarks})</>}
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">Change Status:</span>
              <div className="flex items-center space-x-2 mt-2">
                {getAvailableTransitions().map((transition) => (
                  <Button
                    key={transition.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(transition.value)}
                  >
                    {transition.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={onViewDetails} className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Full Details</span>
            </Button>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Notes:</span> {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

export default OrderCard;
