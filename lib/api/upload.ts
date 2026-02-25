import { api } from './index';
import type { UploadedImage } from '@/types';

/**
 * Upload API endpoints
 * Handles image upload and deletion via Cloudinary
 */
export const uploadAPI = {
  /**
   * Upload a single image
   */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{
      success: boolean;
      data: UploadedImage;
    }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Upload multiple images
   */
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post<{
      success: boolean;
      data: UploadedImage[];
    }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Delete image by Cloudinary public ID
   */
  deleteImage: (publicId: string) =>
    api.delete<{ success: boolean; message: string }>(`/upload/image/${publicId}`),
};
