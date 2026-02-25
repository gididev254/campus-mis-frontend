'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { ordersAPI } from '@/lib/api/orders';
import { useRouter } from 'next/navigation';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';
import type { CartItem, ShippingAddress } from '@/types';

export default function CartPageClient() {
  return (
    <ClientErrorBoundary>
      <CartPageContent />
    </ClientErrorBoundary>
  );
}

function CartPageContent() {
  const { cart, cartCount, cartTotal, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    building: '',
    room: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/buyer/cart');
    }
  }, [isAuthenticated, router]);

  // Stable handlers with useCallback
  const handleRemoveItem = useCallback(async (productId: string) => {
    if (confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(productId);
        toast.success('Item removed from cart');
      } catch (error) {
        console.error('Failed to remove item:', error);
        toast.error('Failed to remove item');
      }
    }
  }, [removeFromCart]);

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity.');
    }
  }, [updateQuantity]);

  const handleClearCart = useCallback(async () => {
    if (confirm('Clear all items from cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared successfully');
      } catch (error) {
        console.error('Failed to clear cart:', error);
        toast.error('Failed to clear cart.');
      }
    }
  }, [clearCart]);

  const handleCheckout = useCallback(async (productId: string, address: ShippingAddress) => {
    try {
      // Create order from cart item
      const order = await ordersAPI.createOrder({
        productId,
        quantity: 1,
        shippingAddress: address,
      });

      // Redirect to order details/payment
      router.push(`/buyer/orders/${order.data.order._id}`);
    } catch (error: unknown) {
      console.error('Failed to checkout:', error);
      toast.error('Failed to proceed to checkout.');
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  }, [router]);

  // Memoize seller grouping for cart checkout
  const itemsBySeller = useMemo(() => {
    return cart.reduce((acc, item) => {
      const sellerId = item.product.seller._id;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerName: item.product.seller.name,
          items: [],
          total: 0
        };
      }
      acc[sellerId].items.push(item);
      acc[sellerId].total += item.product.price * item.quantity;
      return acc;
    }, {} as Record<string, { sellerName: string; items: CartItem[]; total: number }>);
  }, [cart]);

  // Memoize seller groups and count
  const { sellerGroups, sellerCount } = useMemo(() => {
    const groups = Object.values(itemsBySeller);
    return {
      sellerGroups: groups,
      sellerCount: groups.length
    };
  }, [itemsBySeller]);

  // Memoize unique seller count for display
  const uniqueSellerCount = useMemo(() => {
    return new Set(cart.map(item => item.product.seller._id)).size;
  }, [cart]);

  const handleCheckoutAll = useCallback(async () => {
    if (cart.length === 0) return;

    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.building || !shippingAddress.room) {
      setShowAddressForm(true);
      toast.error('Please fill in your shipping address');
      return;
    }

    const phoneNumber = user?.phone || '';
    if (!phoneNumber) {
      toast.error('Please update your phone number in your profile', {
        action: {
          label: 'Update Profile',
          onClick: () => router.push('/profile')
        }
      });
      return;
    }

    try {
      setProcessing(true);

      // Build confirmation message
      const sellerBreakdown = sellerGroups
        .map((g) => `- ${g.sellerName}: ${formatPrice(g.total)} (${g.items.length} item(s))`)
        .join('\n');

      const confirmed = confirm(
        `You will be charged ${formatPrice(cartTotal)} for ${cartCount} item(s) from ${sellerCount} seller(s).\n\n` +
        `Breakdown by seller:\n${sellerBreakdown}\n\n` +
        `Proceed with payment?`
      );

      if (!confirmed) {
        setProcessing(false);
        return;
      }

      const response = await ordersAPI.checkoutCart({
        shippingAddress,
        phoneNumber,
        paymentMethod: 'mpesa'
      });

      await clearCart();

      toast.success(
        `Checkout successful! ${response.data.orderCount} order(s) created. Please check your phone for M-Pesa prompt.`,
        {
          description: `Total: ${formatPrice(response.data.totalAmount)}`
        }
      );

      router.push(`/buyer/orders?session=${response.data.checkoutSessionId}`);
    } catch (error: unknown) {
      console.error('Failed to checkout:', error);
      toast.error('Failed to proceed to checkout.');
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [cart, cartCount, cartTotal, shippingAddress, user?.phone, sellerGroups, sellerCount, clearCart, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            {cartCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-destructive hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin text-4xl">⏳</div>
            <p className="mt-4 text-muted-foreground">Loading cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some items to get started!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>Browse Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card"
                >
                  {/* Product image */}
                  <Link
                    href={`/products/${item.product._id}`}
                    className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
                  >
                    <ProductImage
                      src={item.product.images?.[0]}
                      alt={item.product.title}
                      fill
                    />
                  </Link>

                  {/* Product details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product._id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Seller: {item.product.seller?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product._id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1 rounded border hover:bg-accent transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.product._id, item.quantity + 1)
                          }
                          className="p-1 rounded border hover:bg-accent transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item total and buy button */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Subtotal:{' '}
                        <span className="font-semibold text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </p>
                      <Link
                        href={`/buyer/checkout?productId=${item.product._id}&quantity=${item.quantity}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address Form */}
            {showAddressForm && (
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
            )}

            {/* Cart summary */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Seller count indicator */}
              {cart.length > 0 && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Items from {uniqueSellerCount} seller(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You'll receive one M-Pesa prompt for the total amount
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAll}
                disabled={processing || cart.length === 0}
                className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link
                href="/products"
                className="block w-full mt-3 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
