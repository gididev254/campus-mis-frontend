'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api/users';
import type { User, Product, Order, Review, PaginationInfo, DashboardStats } from '@/types';

/**
 * Query keys for users
 * Used for cache management and invalidation
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  reviews: (id: string) => [...userKeys.all, 'reviews', id] as const,
  dashboard: () => [...userKeys.all, 'dashboard'] as const,
};

/**
 * Custom hook to fetch all users (admin)
 *
 * @param params - Optional filters and pagination
 * @param options - React Query options
 * @returns Users query result
 */
export function useUsers(
  params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  },
  options?: Partial<UseQueryOptions<{
    success: boolean;
    users: User[];
    pagination: PaginationInfo;
  }>>
) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersAPI.getUsers(params).then(res => res.data),
    ...options,
  });
}

/**
 * Custom hook to fetch a user by ID with their products
 *
 * @param id - User ID
 * @param options - React Query options
 * @returns User query result
 */
export function useUser(
  id: string,
  options?: Partial<UseQueryOptions<User & { products: Product[] }>>
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersAPI.getUser(id).then(res => res.data.user),
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook to fetch user profile
 *
 * @param id - User ID
 * @param options - React Query options
 * @returns User profile query result
 */
export function useUserProfile(
  id: string,
  options?: Partial<UseQueryOptions<User>>
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersAPI.getUserProfile(id).then(res => res.data.user),
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook to fetch user reviews
 *
 * @param id - User ID
 * @param options - React Query options
 * @returns User reviews query result
 */
export function useUserReviews(
  id: string,
  options?: Partial<UseQueryOptions<Review[]>>
) {
  return useQuery({
    queryKey: userKeys.reviews(id),
    queryFn: () => usersAPI.getUserReviews(id).then(res => res.data.reviews),
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook to fetch dashboard statistics
 *
 * Dashboard stats are cached for 2 minutes
 *
 * @param options - React Query options
 * @returns Dashboard stats query result
 */
export function useDashboardStats(
  options?: Partial<UseQueryOptions<{
    stats: DashboardStats;
    recentProducts: Product[];
    recentOrders: Order[];
  }>>
) {
  return useQuery({
    queryKey: userKeys.dashboard(),
    queryFn: () => usersAPI.getDashboardStats().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change periodically
    ...options,
  });
}

/**
 * Custom hook to update a user (admin)
 *
 * @returns Mutation object for updating users
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        role?: string;
        isVerified?: boolean;
        isActive?: boolean;
      };
    }) => usersAPI.updateUser(id, data),
    onSuccess: (response, { id }) => {
      // Invalidate the specific user query
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });

      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Custom hook to delete a user (admin)
 *
 * @returns Mutation object for deleting users
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Custom hook to reset user password (admin)
 *
 * @returns Mutation object for resetting passwords
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => usersAPI.resetUserPassword(id),
  });
}
