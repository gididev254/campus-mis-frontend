'use client';

import { useEffect } from 'react';

/**
 * Custom hook for keyboard navigation
 * Adds common keyboard shortcuts to components
 *
 * @param shortcuts - Map of keyboard keys to handlers
 */
export function useKeyboardNavigation(
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = shortcuts[e.key];

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, isActive]);
}

/**
 * Common keyboard shortcuts for web applications
 */
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;
