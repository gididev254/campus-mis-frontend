import { api } from './index';
import type { Cart } from '@/types';

/**
 * Cart API endpoints
 * Handles shopping cart operations
 */
export const cartAPI = {
  /**
   * Get current user's cart
   */
  getCart: () =>
    api.get<{ success: boolean; data: Cart }>('/cart'),

  /**
   * Add item to cart
   */
  addItem: (data: {
    productId: string;
    quantity?: number;
  }) => api.post<{
    success: boolean;
    message: string;
    data: Cart;
  }>('/cart/items', data),

  /**
   * Remove item from cart
   */
  removeItem: (productId: string) =>
    api.delete<{
      success: boolean;
      message: string;
      data: Cart;
    }>(`/cart/items/${productId}`),

  /**
   * Update item quantity in cart
   */
  updateItemQuantity: (productId: string, quantity: number) =>
    api.put<{
      success: boolean;
      message: string;
      data: Cart;
    }>(`/cart/items/${productId}`, { quantity }),

  /**
   * Clear all items from cart
   */
  clearCart: () =>
    api.delete<{
      success: boolean;
      message: string;
      data: Cart;
    }>('/cart'),
};
