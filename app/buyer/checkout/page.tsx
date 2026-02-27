'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, MapPin } from 'lucide-react';
import { productsAPI } from '@/lib/api/products';
import { ordersAPI } from '@/lib/api/orders';
import { useAuth } from '@/contexts/AuthContext';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';
import { formatPrice } from '@/lib/utils';
import type { Product, ShippingAddress } from '@/types';

export default function CheckoutPage() {
  return (
    <ClientErrorBoundary>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutPageContent />
      </Suspense>
    </ClientErrorBoundary>
  );
}

function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    building: '',
    room: ''
  });
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [checkoutRequestID, setCheckoutRequestID] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!productId) {
      router.push('/products');
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getProduct(productId);
        setProduct(res.data.product);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product.');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isAuthenticated, router]);

  const handlePlaceOrder = useCallback(async () => {
    if (!product) return;

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number for M-Pesa payment');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.building || !shippingAddress.room) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    setProcessing(true);
    try {
      // Create order
      const orderRes = await ordersAPI.createOrder({
        productId: product._id,
        quantity,
        paymentMethod: 'mpesa',
        shippingAddress,
      });

      const order = orderRes.data.order;

      // Initiate M-Pesa payment
      const paymentRes = await ordersAPI.initiatePayment(order._id, {
        phoneNumber,
      });

      const checkoutID = paymentRes.data.checkoutRequestID;
      setCheckoutRequestID(checkoutID);
      setPendingOrder(order);

      toast.success(`Payment initiated! Please check your phone for the M-Pesa prompt.\n\nCheckout Request ID: ${checkoutID}`);

      // Start polling for payment status
      pollPaymentStatus(order._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      setProcessing(false);
    }
  }, [product, phoneNumber, shippingAddress, quantity, router]);

  // Poll for payment status
  const pollPaymentStatus = useCallback(async (orderId: string) => {
    const maxAttempts = 30; // Poll for up to 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const statusRes = await ordersAPI.getPaymentStatus(orderId);
        const status = statusRes.data.data.paymentStatus;

        console.log('[Checkout] Payment status check:', { attempt: attempts + 1, status });

        if (status === 'completed') {
          setPaymentStatus('completed');
          setProcessing(false);
          toast.success('Payment successful! Redirecting to your order...');
          setTimeout(() => {
            router.push(`/buyer/orders/${orderId}`);
          }, 2000);
          return;
        }

        if (status === 'failed') {
          setPaymentStatus('failed');
          setProcessing(false);
          toast.error('Payment failed. Please try again.');
          return;
        }

        // Still pending, continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setProcessing(false);
          toast.error('Payment verification timed out. Please check your orders page for status.');
          setTimeout(() => {
            router.push(`/buyer/orders/${orderId}`);
          }, 3000);
        }
      } catch (error) {
        console.error('[Checkout] Error polling payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setProcessing(false);
          toast.error('Unable to verify payment. Please check your orders page.');
          setTimeout(() => {
            router.push(`/buyer/orders/${orderId}`);
          }, 3000);
        }
      }
    };

    poll();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Payment waiting state
  if (pendingOrder && checkoutRequestID) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border bg-card p-8 text-center">
            {paymentStatus === 'pending' ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Waiting for Payment</h2>
                <p className="text-muted-foreground mb-6">
                  Please check your phone and enter your M-Pesa PIN to complete the payment.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Checkout Request ID:</p>
                  <p className="font-mono font-semibold">{checkoutRequestID}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  This page will automatically update once payment is confirmed...
                </p>
              </>
            ) : paymentStatus === 'completed' ? (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
                <p className="text-muted-foreground">Redirecting to your order details...</p>
              </>
            ) : (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">
                  The payment could not be completed. Please try again.
                </p>
                <button
                  onClick={() => {
                    setPendingOrder(null);
                    setCheckoutRequestID('');
                    setPaymentStatus('pending');
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const total = product.price * quantity;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="space-y-6">
          {/* Product summary */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-muted-foreground">Seller: {product.seller?.name}</p>
                <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Street/Hall Name *
                </label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder="e.g., Main Street, Hostel A"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Building/Floor *
                </label>
                <input
                  type="text"
                  value={shippingAddress.building}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, building: e.target.value })}
                  placeholder="e.g., Building 1, 2nd Floor"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={shippingAddress.room}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, room: e.target.value })}
                  placeholder="e.g., Room 123, 2B"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g., 0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You will receive an M-Pesa prompt on this number
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>x{quantity}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Place order button */}
          <button
            onClick={handlePlaceOrder}
            disabled={processing}
            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              `Place Order - ${formatPrice(total)}`
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            By placing this order, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
