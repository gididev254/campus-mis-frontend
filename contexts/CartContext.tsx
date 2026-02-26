'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { cartAPI } from '@/lib/api/cart';
import { toast } from '@/components/ui/Toaster';
import { useAuth } from './AuthContext';
import type { CartItem } from '@/types';

interface StoredCart {
  items: CartItem[];
  timestamp: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeCartWithServer: () => Promise<void>;
  clearLocalCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campus_market_cart';
const CART_EXPIRATION_DAYS = 7;

// Helper functions for localStorage management
const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed: StoredCart = JSON.parse(stored);

    // Check if cart has expired (7 days)
    const expirationTime = CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsed.timestamp > expirationTime;

    if (isExpired) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    // Validate cart data structure
    if (!Array.isArray(parsed.items)) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    // Validate each cart item
    const validItems = parsed.items.filter(item => {
      return (
        item &&
        typeof item === 'object' &&
        item.product &&
        typeof item.product === 'object' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    });

    return validItems;
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    const storedCart: StoredCart = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const clearCartFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Merge local cart items with server cart items
 * Local cart takes precedence for quantity (user's most recent intent)
 * @param localItems - Items from localStorage
 * @param serverItems - Items from server
 * @returns Merged cart items without duplicates
 */
const mergeCartItems = (localItems: CartItem[], serverItems: CartItem[]): CartItem[] => {
  const mergedMap = new Map<string, CartItem>();

  // Add server items first
  serverItems.forEach(item => {
    const productId = item.product?._id;
    if (productId) {
      mergedMap.set(productId, item);
    }
  });

  // Override with local items (user's most recent intent)
  localItems.forEach(item => {
    const productId = item.product?._id;
    if (productId) {
      const existing = mergedMap.get(productId);
      if (existing) {
        // Update quantity if local item has different quantity
        if (existing.quantity !== item.quantity) {
          mergedMap.set(productId, {
            ...existing,
            quantity: item.quantity,
          });
        }
      } else {
        // Add new item from local storage
        mergedMap.set(productId, item);
      }
    }
  });

  return Array.from(mergedMap.values());
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Memoize cart count and total to prevent recalculation
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0), [cart]);

  // Sync local cart items to server
  const syncLocalCartToServer = useCallback(async (localItems: CartItem[], serverItems: CartItem[]): Promise<void> => {
    if (!isAuthenticated || localItems.length === 0) return;

    try {
      // Get server product IDs
      const serverProductIds = new Set(serverItems.map(item => item.product?._id));

      // Add items that don't exist on server
      for (const localItem of localItems) {
        const productId = localItem.product?._id;
        if (!productId) continue;

        const serverItem = serverItems.find(item => item.product?._id === productId);

        if (!serverItem) {
          // Item doesn't exist on server, add it
          try {
            await cartAPI.addItem({
              productId,
              quantity: localItem.quantity,
            });
          } catch (error) {
            console.error(`Failed to sync item ${productId} to server:`, error);
          }
        } else if (serverItem.quantity !== localItem.quantity) {
          // Item exists but quantity differs, update it
          try {
            await cartAPI.updateItemQuantity(productId, localItem.quantity);
          } catch (error) {
            console.error(`Failed to update quantity for item ${productId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing local cart to server:', error);
    }
  }, [isAuthenticated]);

  // Stable fetchCart function
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Not authenticated, keep using local cart from storage
      const storedCart = getStoredCart();
      setCart(storedCart);
      return;
    }

    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      const serverItems = response.data.data.items || [];

      // Get local cart and merge with server cart
      const localItems = getStoredCart();
      const mergedItems = mergeCartItems(localItems, serverItems);

      setCart(mergedItems);

      // Save merged cart to storage
      saveCartToStorage(mergedItems);

      // If there were local items, sync them to server
      if (localItems.length > 0) {
        await syncLocalCartToServer(localItems, serverItems);
      }
    } catch (error) {
      toast.error('Failed to fetch cart items');
      // On error, fall back to local cart
      const storedCart = getStoredCart();
      setCart(storedCart);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, syncLocalCartToServer]);

  // Stable addToCart function
  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      let updatedCart: CartItem[];

      if (isAuthenticated) {
        // Authenticated: sync with server
        const response = await cartAPI.addItem({ productId, quantity });
        updatedCart = response.data.data.items || [];
      } else {
        // Not authenticated: update local cart only
        const existingItemIndex = cart.findIndex(
          item => item.product?._id === productId
        );

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          updatedCart = cart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item (we need to fetch the product details first)
          // For now, we'll throw an error if we don't have the product info
          throw new Error('Product details not available. Please try again.');
        }

        toast.success('Item added to cart');
      }

      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    } catch (error) {
      toast.error('Failed to add item to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  // Stable removeFromCart function
  const removeFromCart = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      let updatedCart: CartItem[];

      if (isAuthenticated) {
        // Authenticated: sync with server
        const response = await cartAPI.removeItem(productId);
        updatedCart = response.data.data.items || [];
      } else {
        // Not authenticated: update local cart only
        updatedCart = cart.filter(item => item.product?._id !== productId);
        toast.success('Item removed from cart');
      }

      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    } catch (error) {
      toast.error('Failed to remove item from cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  // Stable updateQuantity function
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    setLoading(true);
    try {
      let updatedCart: CartItem[];

      if (isAuthenticated) {
        // Authenticated: sync with server
        const response = await cartAPI.updateItemQuantity(productId, quantity);
        updatedCart = response.data.data.items || [];
      } else {
        // Not authenticated: update local cart only
        updatedCart = cart.map(item =>
          item.product?._id === productId
            ? { ...item, quantity }
            : item
        );
      }

      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    } catch (error) {
      toast.error('Failed to update quantity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Authenticated: clear from server
        const response = await cartAPI.clearCart();
        setCart(response.data.data.items || []);
      } else {
        // Not authenticated: clear local only
        setCart([]);
      }
      clearCartFromStorage();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Stable mergeCartWithServer function
  const mergeCartWithServer = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;

    const localItems = getStoredCart();
    if (localItems.length === 0) {
      // No local items to merge, just fetch server cart
      await fetchCart();
      return;
    }

    setLoading(true);
    try {
      // Fetch server cart
      const response = await cartAPI.getCart();
      const serverItems = response.data.data.items || [];

      // Merge carts (local takes precedence)
      const mergedItems = mergeCartItems(localItems, serverItems);

      // Update state
      setCart(mergedItems);
      saveCartToStorage(mergedItems);

      // Sync to server
      await syncLocalCartToServer(localItems, serverItems);

      // Fetch cart again to ensure consistency
      const finalResponse = await cartAPI.getCart();
      setCart(finalResponse.data.data.items || []);
      saveCartToStorage(finalResponse.data.data.items || []);

      toast.success('Cart merged successfully');
    } catch (error) {
      console.error('Error merging cart with server:', error);
      // On error, just fetch server cart
      await fetchCart();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart, syncLocalCartToServer]);

  // Stable clearLocalCart function
  const clearLocalCart = useCallback((): void => {
    clearCartFromStorage();
    setCart([]);
  }, []);

  // Initialize cart from localStorage on mount (before auth check)
  useEffect(() => {
    const storedCart = getStoredCart();
    if (storedCart.length > 0) {
      setCart(storedCart);
    }
  }, []); // Run only once on mount

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in, merge local cart with server
      mergeCartWithServer();
    } else {
      // User logged out, clear cart and load from localStorage
      setCart([]);
      const storedCart = getStoredCart();
      if (storedCart.length > 0) {
        setCart(storedCart);
      }
    }
  }, [isAuthenticated, mergeCartWithServer]); // Run when auth state changes

  // Cross-tab synchronization: listen for storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        // Cart was updated in another tab
        const newValue = e.newValue;
        if (newValue) {
          try {
            const parsed: StoredCart = JSON.parse(newValue);

            // Check if cart has expired
            const expirationTime = CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
            const isExpired = Date.now() - parsed.timestamp > expirationTime;

            if (!isExpired && Array.isArray(parsed.items)) {
              // Validate and update cart
              const validItems = parsed.items.filter(item => {
                return (
                  item &&
                  typeof item === 'object' &&
                  item.product &&
                  typeof item.product === 'object' &&
                  typeof item.quantity === 'number' &&
                  item.quantity > 0
                );
              });
              setCart(validItems);
            } else {
              // Cart expired or invalid, clear it
              setCart([]);
            }
          } catch (error) {
            console.error('Error parsing cart from storage event:', error);
          }
        } else {
          // Cart was cleared in another tab
          setCart([]);
        }
      }
    };

    // Add event listener for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Run once on mount

  // Cleanup expired cart items periodically (every hour)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const storedCart = getStoredCart();
      if (storedCart.length > 0) {
        // Re-validate cart and remove expired items
        saveCartToStorage(storedCart);
      }
    }, 60 * 60 * 1000); // Every hour

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []); // Run once on mount

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    cart,
    cartCount,
    cartTotal,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    mergeCartWithServer,
    clearLocalCart,
  }), [cart, cartCount, cartTotal, loading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart, mergeCartWithServer, clearLocalCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    toast.warning('Cart not initialized properly');
    return {
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      loading: false,
      fetchCart: async () => {},
      addToCart: async () => { throw new Error('CartProvider not found'); },
      removeFromCart: async () => { throw new Error('CartProvider not found'); },
      updateQuantity: async () => { throw new Error('CartProvider not found'); },
      clearCart: async () => { throw new Error('CartProvider not found'); },
      mergeCartWithServer: async () => {},
      clearLocalCart: () => {},
    };
  }
  return context;
}
