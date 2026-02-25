import { api } from './index';
import type { Message, Conversation, PaginationResponse } from '@/types';

/**
 * Messages API endpoints
 * Handles messaging, conversations, and read status
 */
export const messagesAPI = {
  /**
   * Send a message
   */
  sendMessage: (data: {
    receiver: string;
    product?: string;
    content: string;
  }) => api.post<{ success: boolean; data: Message }>('/messages', data),

  /**
   * Get conversation with a specific user
   */
  getConversation: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginationResponse<Message>>(`/messages/conversation/${userId}`, { params }),

  /**
   * Get all conversations
   */
  getConversations: () =>
    api.get<{ success: boolean; conversations: Conversation[] }>('/messages/conversations'),

  /**
   * Get unread message count
   */
  getUnreadCount: () =>
    api.get<{ success: boolean; count: number }>('/messages/unread-count'),

  /**
   * Mark message as read
   */
  markAsRead: (id: string) =>
    api.put<{ success: boolean; message: string }>(`/messages/${id}/read`),
};
