import { api } from './index';
import type { Wishlist } from '@/types';

/**
 * Wishlist API endpoints
 * Handles user wishlist operations
 */
export const wishlistAPI = {
  /**
   * Get current user's wishlist
   */
  getWishlist: () =>
    api.get<{ success: boolean; data: Wishlist }>('/wishlist'),

  /**
   * Add product to wishlist
   */
  addWishlist: (productId: string) =>
    api.post<{
      success: boolean;
      message: string;
      data: Wishlist;
    }>(`/wishlist/${productId}`),

  /**
   * Remove product from wishlist
   */
  removeWishlist: (productId: string) =>
    api.delete<{
      success: boolean;
      message: string;
      data: Wishlist;
    }>(`/wishlist/${productId}`),

  /**
   * Check if product is in wishlist
   */
  isInWishlist: (productId: string) =>
    api.get<{ success: boolean; inWishlist: boolean }>(`/wishlist/check/${productId}`),
};
