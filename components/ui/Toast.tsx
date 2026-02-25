'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const progressStyles = {
  success: 'bg-green-500 dark:bg-green-400',
  error: 'bg-red-500 dark:bg-red-400',
  warning: 'bg-yellow-500 dark:bg-yellow-400',
  info: 'bg-blue-500 dark:bg-blue-400',
};

export function Toast({ id, message, variant = 'info', duration = 4000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const Icon = toastIcons[variant];

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // Update every 50ms
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          handleClose();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    // Allow exit animation to complete
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'min-w-[300px] max-w-md',
        'transition-all duration-300 ease-in-out',
        toastStyles[variant],
        isVisible
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-full scale-95'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 rounded-md p-1',
          'hover:bg-black/10 dark:hover:bg-white/10',
          'focus:outline-none focus:ring-2 focus:ring-current',
          'transition-colors'
        )}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-1 rounded-b-lg transition-all duration-50 ease-linear',
          progressStyles[variant]
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
