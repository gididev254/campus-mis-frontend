import { api } from './index';
import type { User, AuthResponse } from '@/types';

/**
 * Authentication API endpoints
 * Handles user registration, login, profile management, and password operations
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    location?: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  /**
   * Login user
   */
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  /**
   * Get current authenticated user
   */
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),

  /**
   * Update user profile
   */
  updateProfile: (data: {
    name?: string;
    phone?: string;
    location?: string;
  }) => api.put<{ success: boolean; user: User }>('/auth/profile', data),

  /**
   * Change password
   */
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put<{ success: boolean; message: string }>('/users/change-password', data),

  /**
   * Request password reset email
   */
  forgotPassword: (data: { email: string }) =>
    api.post<{ success: boolean; message: string }>('/auth/forgot-password', data),

  /**
   * Reset password with token
   */
  resetPassword: (data: {
    token: string;
    newPassword: string;
  }) => api.post<{ success: boolean; message: string }>('/auth/reset-password', data),

  /**
   * Refresh authentication token
   */
  refreshToken: (token: string) =>
    api.post<{ success: boolean; token: string }>('/auth/refresh-token', { token }),
};
