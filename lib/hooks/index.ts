/**
 * React Query Hooks Index
 *
 * Exports all custom React Query hooks for data fetching and mutations.
 * These hooks provide automatic caching, refetching, and optimistic updates.
 *
 * @module lib/hooks
 */

// Products hooks
export {
  useProducts,
  useProduct,
  useSellerProducts,
  useSoldProducts,
  useRelatedProducts,
  useToggleLike,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useRelistProduct,
  productKeys,
} from './useProducts';

// Categories hooks
export {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryKeys,
} from './useCategories';

// Orders hooks
export {
  useOrders,
  useOrder,
  useOrdersBySession,
  usePayoutLedger,
  useCreateOrder,
  useInitiatePayment,
  useUpdateOrderStatus,
  useCancelOrder,
  useMarkSellerPaid,
  useMarkSellerPaidBatch,
  useCheckoutCart,
  orderKeys,
} from './useOrders';

// Users hooks
export {
  useUsers,
  useUser,
  useUserProfile,
  useUserReviews,
  useDashboardStats,
  useUpdateUser,
  useDeleteUser,
  useResetUserPassword,
  userKeys,
} from './useUsers';

// Socket connection hooks
export {
  useSocketConnection,
  useSocketDisabled,
  useSocketStatus,
  useSocketQueue,
} from './useSocketConnection';
