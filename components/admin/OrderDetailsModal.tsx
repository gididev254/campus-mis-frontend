'use client';

import { memo, useCallback, useState } from 'react';
import { X, Package, User, ShoppingCart, Clock, CheckCircle, XCircle, Truck, RefreshCw, MapPin, IndianRupee } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
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

const OrderDetailsModal = memo(function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = useCallback(async (newStatus: string) => {
    try {
      setUpdating(true);
      await onStatusUpdate(order._id, newStatus);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  }, [order._id, onStatusUpdate, onClose]);

  // Get available status transitions
  const getAvailableTransitions = () => {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      refunded: [],
    };

    return validTransitions[order.status] || [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Information</span>
            </h3>
            <div className="border rounded-lg p-4 bg-muted">
              <div className="flex items-start space-x-4">
                {order.product?.images && order.product.images.length > 0 && (
                  <img
                    src={order.product.images[0]}
                    alt={order.product?.title || 'Product'}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{order.product?.title || 'Unknown Product'}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {order.product?.description?.substring(0, 150)}
                    {order.product?.description && order.product.description.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Condition:</span>{' '}
                      <span className="font-medium">{order.product?.condition || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>{' '}
                      <span className="font-medium">{order.product?.category?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">{formatPrice(order.product?.price || 0)}</p>
                  <p className="text-sm text-muted-foreground mt-2">Quantity: {order.quantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer & Seller Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Buyer</span>
              </h3>
              <div className="border rounded-lg p-4 bg-muted">
                <p className="font-medium">{order.buyer?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{order.buyer?.email || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{order.buyer?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Seller */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Seller</span>
              </h3>
              <div className="border rounded-lg p-4 bg-muted">
                <p className="font-medium">{order.seller?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{order.seller?.email || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{order.seller?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Shipping Address</span>
              </h3>
              <div className="border rounded-lg p-4 bg-muted">
                <p className="whitespace-pre-line">
                  {order.shippingAddress.street && `${order.shippingAddress.street}\n`}
                  {order.shippingAddress.building && `${order.shippingAddress.building}\n`}
                  {order.shippingAddress.room && `Room ${order.shippingAddress.room}\n`}
                  {order.shippingAddress.city && `${order.shippingAddress.city}\n`}
                  {order.shippingAddress.landmarks && `(Near: ${order.shippingAddress.landmarks})`}
                </p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <IndianRupee className="h-5 w-5" />
              <span>Payment Information</span>
            </h3>
            <div className="border rounded-lg p-4 bg-muted space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <p className="text-xl font-bold">{formatPrice(order.totalPrice)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <p className="font-medium">{order.paymentMethod?.toUpperCase() || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <p className="font-medium">{order.mpesaPhoneNumber || 'N/A'}</p>
                </div>
              </div>
              {order.mpesaTransactionId && (
                <div>
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <p className="font-mono text-sm">{order.mpesaTransactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Timeline</h3>
            <div className="border rounded-lg p-4 bg-muted space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Order placed on {formatDate(order.createdAt)}</span>
              </div>
              {order.deliveredAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Delivered on {formatDate(order.deliveredAt)}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex items-center space-x-3">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cancelled on {formatDate(order.cancelledAt)}</span>
                  {order.cancellationReason && (
                    <span className="text-sm text-muted-foreground">
                      ({order.cancellationReason.replace('-', ' ')})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Notes</h3>
              <div className="border rounded-lg p-4 bg-muted">
                <p className="text-sm">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Seller Payout Info */}
          {order.sellerPaid && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Seller Payout</h3>
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Seller paid on {formatDate(order.sellerPaidAt || '')}
                </p>
                {order.sellerPayoutNotes && (
                  <p className="text-sm text-muted-foreground mt-1">Notes: {order.sellerPayoutNotes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-background border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Update Status:</span>
              {getAvailableTransitions().map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
              {getAvailableTransitions().length === 0 && (
                <span className="text-sm text-muted-foreground">No further actions available</span>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OrderDetailsModal;
