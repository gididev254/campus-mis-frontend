import { api } from './index';
import type { User, Product, Order, Review, PaginationInfo, DashboardStats } from '@/types';

/**
 * Users API endpoints
 * Handles user management, admin operations, and dashboard stats
 */
export const usersAPI = {
  /**
   * Get all users (admin)
   */
  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => api.get<{
    success: boolean;
    users: User[];
    pagination: PaginationInfo;
  }>('/users', { params }),

  /**
   * Get user by ID with their products
   */
  getUser: (id: string) =>
    api.get<{
      success: boolean;
      user: User & { products: Product[] };
    }>(`/users/${id}`),

  /**
   * Update user (admin)
   */
  updateUser: (id: string, data: {
    role?: string;
    isVerified?: boolean;
    isActive?: boolean;
  }) => api.put<{ success: boolean; user: User }>(`/users/${id}`, data),

  /**
   * Delete user (admin)
   */
  deleteUser: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),

  /**
   * Reset user password (admin)
   */
  resetUserPassword: (id: string) =>
    api.post<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        name: string;
        email: string;
        phone: string;
        newPassword: string;
      };
    }>(`/users/${id}/reset-password`),

  /**
   * Get user profile
   */
  getUserProfile: (id: string) =>
    api.get<{ success: boolean; user: User }>(`/users/${id}`),

  /**
   * Get user reviews
   */
  getUserReviews: (id: string) =>
    api.get<{ success: boolean; reviews: Review[] }>(`/reviews/user/${id}`),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: () =>
    api.get<{
      success: boolean;
      stats: DashboardStats;
      recentProducts: Product[];
      recentOrders: Order[];
    }>('/users/dashboard/stats'),
};
