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

      toast.success(`Payment initiated! Please check your phone for the M-Pesa prompt. Checkout Request ID: ${paymentRes.data.checkoutRequestID}`);

      // Redirect to order details
      router.push(`/buyer/orders/${order._id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [product, phoneNumber, shippingAddress, quantity, router]);

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
