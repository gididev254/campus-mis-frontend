'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api/categories';
import type { Category, Product, PaginationInfo } from '@/types';

/**
 * Query keys for categories
 * Used for cache management and invalidation
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string, params?: { page?: number; limit?: number }) =>
    [...categoryKeys.details(), id, params] as const,
};

/**
 * Custom hook to fetch all categories with product counts
 *
 * Categories are cached for 10 minutes since they rarely change
 *
 * @param options - React Query options
 * @returns Categories query result
 */
export function useCategories(
  options?: Partial<UseQueryOptions<(Category & { productCount: number })[]>>
) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () =>
      categoriesAPI.getCategories().then(res => res.data.categories),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep categories cached longer
    ...options,
  });
}

/**
 * Custom hook to fetch a single category with products
 *
 * @param id - Category ID or slug
 * @param params - Optional pagination
 * @param options - React Query options
 * @returns Category query result
 */
export function useCategory(
  id: string,
  params?: { page?: number; limit?: number },
  options?: Partial<UseQueryOptions<{
    category: Category & { productCount: number };
    products: Product[];
    pagination: PaginationInfo;
  }>>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id, params),
    queryFn: () => categoriesAPI.getCategory(id, params).then(res => res.data),
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook to create a new category
 *
 * @returns Mutation object for creating categories
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      icon?: string;
      image?: string;
      parentCategory?: string;
    }) => categoriesAPI.createCategory(data),
    onSuccess: () => {
      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Custom hook to update a category
 *
 * @returns Mutation object for updating categories
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        icon?: string;
        image?: string;
        isActive?: boolean;
      };
    }) => categoriesAPI.updateCategory(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate the specific category query
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });

      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Custom hook to delete a category
 *
 * @returns Mutation object for deleting categories
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesAPI.deleteCategory(id),
    onSuccess: () => {
      // Invalidate categories list queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
