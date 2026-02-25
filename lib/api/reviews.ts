import { api } from './index';
import type { Review, PaginationResponse } from '@/types';

/**
 * Reviews API endpoints
 * Handles review creation, retrieval, and management
 */
export const reviewsAPI = {
  /**
   * Create a new review
   */
  createReview: (data: {
    reviewedUser: string;
    product?: string;
    order: string;
    rating: number;
    comment: string;
  }) => api.post<{ success: boolean; review: Review }>('/reviews', data),

  /**
   * Get reviews for a specific user
   */
  getUserReviews: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginationResponse<Review>>(`/reviews/user/${userId}`, { params }),

  /**
   * Get reviews written by current user
   */
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    api.get<PaginationResponse<Review>>('/reviews/my-reviews', { params }),

  /**
   * Get single review by ID
   */
  getReview: (id: string) =>
    api.get<{ success: boolean; review: Review }>(`/reviews/${id}`),

  /**
   * Update review
   */
  updateReview: (id: string, data: {
    rating?: number;
    comment?: string;
  }) => api.put<{ success: boolean; review: Review }>(`/reviews/${id}`, data),

  /**
   * Delete review
   */
  deleteReview: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/reviews/${id}`),
};
