import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price as Kenyan Shilling
 * @param price - Price in number
 * @returns Formatted price string (e.g., "KES 1,000")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Format date with full date and time
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "February 25, 2026 at 2:30 PM")
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Format date as short date (no time)
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "25 Feb 2026")
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
}

/**
 * Format relative time (ago format)
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Format phone number to Kenyan format
 * @param phone - Phone number string
 * @returns Formatted phone number (e.g., "+254 XXX XXX XXX")
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if number starts with 0 (local format)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }

  // Check if number starts with 254 (international format without +)
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+254 ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }

  // Check if number already has +254
  if (cleaned.startsWith('254') && phone.startsWith('+')) {
    return phone; // Already formatted
  }

  // Return original if format not recognized
  return phone;
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,000")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-KE').format(num);
}

/**
 * Get status badge color classes
 * @param status - Status string
 * @returns Tailwind CSS classes for status badge
 */
export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    sold: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  };
  return colors[status] || colors.pending;
}

/**
 * Get condition badge color classes
 * @param condition - Condition string
 * @returns Tailwind CSS classes for condition badge
 */
export function getConditionBadgeColor(condition: string): string {
  const colors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'like-new': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'good': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'fair': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  };
  return colors[condition] || colors.good;
}
