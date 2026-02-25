import { api } from './index';
import type { Notification, PaginationInfo } from '@/types';

/**
 * Notifications API endpoints
 * Handles notification management and read status
 */
export const notificationsAPI = {
  /**
   * Get all notifications with optional filters
   */
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => api.get<{
    success: boolean;
    data: Notification[];
    pagination: PaginationInfo;
    unreadCount: number;
  }>('/notifications', { params }),

  /**
   * Get unread notification count
   */
  getUnreadCount: () =>
    api.get<{
      success: boolean;
      data: { count: number };
    }>('/notifications/unread-count'),

  /**
   * Mark notification as read
   */
  markAsRead: (id: string) =>
    api.put<{
      success: boolean;
      message: string;
      data: Notification;
    }>(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    api.put<{ success: boolean; message: string }>('/notifications/mark-all-read'),

  /**
   * Delete notification
   */
  deleteNotification: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/notifications/${id}`),

  /**
   * Clear all notifications
   */
  clearAll: () =>
    api.delete<{ success: boolean; message: string }>('/notifications'),
};
