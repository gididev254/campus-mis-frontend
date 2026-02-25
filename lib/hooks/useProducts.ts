'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api/products';
import type { Product, PaginationResponse, Filters } from '@/types';

/**
 * Query keys for products
 * Used for cache management and invalidation
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: Filters & { page?: number; limit?: number }) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  seller: (sellerId: string) => [...productKeys.all, 'seller', sellerId] as const,
  sold: () => [...productKeys.all, 'sold'] as const,
  related: (id: string) => [...productKeys.all, 'related', id] as const,
};

/**
 * Custom hook to fetch products with optional filters
 *
 * @param params - Optional filters and pagination
 * @param options - React Query options
 * @returns Products query result
 */
export function useProducts(
  params?: Filters & { page?: number; limit?: number },
  options?: Partial<UseQueryOptions<PaginationResponse<Product>>>
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsAPI.getProducts(params).then(res => res.data),
    ...options,
  });
}

/**
 * Custom hook to fetch a single product by ID
 *
 * @param id - Product ID
 * @param options - React Query options
 * @returns Product query result
 */
export function useProduct(
  id: string,
  options?: Partial<UseQueryOptions<Product>>
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsAPI.getProduct(id).then(res => res.data.product),
    enabled: !!id, // Only run query if id is provided
    ...options,
  });
}

/**
 * Custom hook to fetch products by seller
 *
 * @param sellerId - Seller user ID
 * @param params - Optional pagination
 * @param options - React Query options
 * @returns Products query result
 */
export function useSellerProducts(
  sellerId: string,
  params?: { page?: number; limit?: number },
  options?: Partial<UseQueryOptions<PaginationResponse<Product>>>
) {
  return useQuery({
    queryKey: [...productKeys.seller(sellerId), params],
    queryFn: () =>
      productsAPI.getSellerProducts(sellerId, params).then(res => res.data),
    enabled: !!sellerId,
    ...options,
  });
}

/**
 * Custom hook to fetch sold products history
 *
 * @param params - Optional filters and pagination
 * @param options - React Query options
 * @returns Sold products query result
 */
export function useSoldProducts(
  params?: {
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  },
  options?: Partial<UseQueryOptions<PaginationResponse<Product>>>
) {
  return useQuery({
    queryKey: [...productKeys.sold(), params],
    queryFn: () => productsAPI.getSoldProducts(params).then(res => res.data),
    ...options,
  });
}

/**
 * Custom hook to fetch related products
 *
 * @param id - Product ID
 * @param options - React Query options
 * @returns Related products query result
 */
export function useRelatedProducts(
  id: string,
  options?: Partial<UseQueryOptions<Product[]>>
) {
  return useQuery({
    queryKey: productKeys.related(id),
    queryFn: () =>
      productsAPI.getRelatedProducts(id).then(res => res.data.products),
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook to toggle like on a product
 *
 * @returns Mutation object for toggling likes
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsAPI.toggleLike(id),
    onSuccess: (response, id) => {
      // Invalidate the specific product query
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });

      // Invalidate products list queries to update like counts
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Custom hook to create a new product
 *
 * @returns Mutation object for creating products
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => productsAPI.createProduct(data),
    onSuccess: () => {
      // Invalidate products list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Custom hook to update a product
 *
 * @returns Mutation object for updating products
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      productsAPI.updateProduct(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate the specific product query
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });

      // Invalidate products list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate seller products queries
      queryClient.invalidateQueries({ queryKey: productKeys.seller(response.data.product.seller) });
    },
  });
}

/**
 * Custom hook to delete a product
 *
 * @returns Mutation object for deleting products
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsAPI.deleteProduct(id),
    onSuccess: () => {
      // Invalidate products list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Custom hook to relist a sold/delisted product
 *
 * @returns Mutation object for relisting products
 */
export function useRelistProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsAPI.relistProduct(id, data),
    onSuccess: () => {
      // Invalidate products list queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      // Invalidate sold products queries
      queryClient.invalidateQueries({ queryKey: productKeys.sold() });
    },
  });
}
