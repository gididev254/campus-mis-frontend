import { api } from './index';
import type { Category, Product, PaginationInfo } from '@/types';

/**
 * Categories API endpoints
 * Handles category CRUD operations
 */
export const categoriesAPI = {
  /**
   * Get all categories with product counts
   */
  getCategories: () =>
    api.get<{
      success: boolean;
      categories: (Category & { productCount: number })[];
    }>('/categories'),

  /**
   * Get single category with products
   */
  getCategory: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<{
      success: boolean;
      category: Category & { productCount: number };
      products: Product[];
      pagination: PaginationInfo;
    }>(`/categories/${id}`, { params }),

  /**
   * Create new category
   */
  createCategory: (data: {
    name: string;
    description?: string;
    icon?: string;
    image?: string;
    parentCategory?: string;
  }) => api.post<{ success: boolean; category: Category }>('/categories', data),

  /**
   * Update category
   */
  updateCategory: (id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
  }) => api.put<{ success: boolean; category: Category }>(`/categories/${id}`, data),

  /**
   * Delete category
   */
  deleteCategory: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/categories/${id}`),
};
