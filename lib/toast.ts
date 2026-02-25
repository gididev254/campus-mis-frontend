import { toast as sonnerToast } from 'sonner';

/**
 * Toast notification utility using Sonner
 *
 * Usage:
 * ```ts
 * import { toast } from '@/lib/toast';
 *
 * toast.success('Operation successful!');
 * toast.error('Something went wrong!');
 * toast.info('Here is some information');
 * toast.warning('Please be careful');
 * ```
 */

export const toast = {
  /**
   * Show a success toast
   * @param message - The message to display
   * @param options - Additional toast options
   */
  success: (message: string, options?: { duration?: number }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
    });
  },

  /**
   * Show an error toast
   * @param message - The message to display
   * @param options - Additional toast options
   */
  error: (message: string, options?: { duration?: number }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 4000,
    });
  },

  /**
   * Show an info toast
   * @param message - The message to display
   * @param options - Additional toast options
   */
  info: (message: string, options?: { duration?: number }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
    });
  },

  /**
   * Show a warning toast
   * @param message - The message to display
   * @param options - Additional toast options
   */
  warning: (message: string, options?: { duration?: number }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 4000,
    });
  },

  /**
   * Show a toast with a promise (loading state)
   * @param promise - The promise to await
   * @param messages - Loading, success, and error messages
   */
  promise: (
    promise: Promise<any>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    sonnerToast.dismiss();
  },
};

// Re-export types from sonner if needed
export type { ToastT } from 'sonner';
