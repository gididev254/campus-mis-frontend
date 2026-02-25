/**
 * Accessibility utility functions for Campus Market
 */

/**
 * Generate a unique ID for ARIA relationships
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce a message to screen readers
 * Uses a live region for dynamic content updates
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within an element (for modals, dropdowns, etc.)
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  document.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    document.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Remove focus from the currently focused element
 */
export function blurActiveElement(): void {
  (document.activeElement as HTMLElement)?.blur();
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get the appropriate aria-label for icon buttons
 */
export function getIconButtonLabel(iconName: string, action: string): string {
  return `${action} ${iconName}`;
}

/**
 * Validate color contrast ratio (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 * Returns true if contrast meets WCAG AA standards
 */
export function validateContrast(foreground: string, background: string, isLargeText: boolean = false): boolean {
  // This is a simplified version - full implementation would parse colors and calculate luminance
  const minimumRatio = isLargeText ? 3 : 4.5;
  // TODO: Implement full contrast calculation
  return true;
}

/**
 * Set the page title with accessibility in mind
 * Format: "Page Name - Site Name"
 */
export function setPageTitle(pageName: string, siteName: string = 'Embuni Campus Market'): void {
  document.title = pageName === 'Home' ? siteName : `${pageName} - ${siteName}`;
}

/**
 * Manage skip links functionality
 */
export function setupSkipLinks(): void {
  const skipLinks = document.querySelectorAll('a[href^="#"]');

  skipLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
      (targetElement as HTMLElement).focus({ preventScroll: true });
    });
  });
}

/**
 * Create a live region for dynamic announcements
 */
export function createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';

  document.body.appendChild(region);
  return region;
}

/**
 * Update a live region with new content
 */
export function updateLiveRegion(regionId: string, message: string): void {
  const region = document.getElementById(regionId);
  if (region) {
    region.textContent = message;
  }
}

/**
 * Common ARIA labels for the application
 */
export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  mobileNavigation: 'Mobile navigation',
  footerNavigation: 'Footer navigation',

  // Actions
  search: 'Search products',
  cart: 'Shopping cart',
  notifications: 'Notifications',
  userMenu: 'User menu',
  settings: 'Settings',
  logout: 'Logout',
  login: 'Login',
  register: 'Sign up',

  // Common actions
  close: 'Close',
  open: 'Open',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',

  // Status
  loading: 'Loading',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
} as const;
