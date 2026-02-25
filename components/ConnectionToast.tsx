'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/contexts/ToastContext';

/**
 * ConnectionToast - Toast notifications for connection state changes
 *
 * Displays toast notifications for:
 * - Disconnection: Shows error with retry instructions
 * - Reconnecting: Shows warning with attempt count
 * - Reconnected: Shows success message
 *
 * Features:
 * - Persistent toast during reconnection attempts
 * - Auto-dismiss on successful reconnection
 * - State tracking to avoid duplicate toasts
 * - User-friendly error messages
 */
const ConnectionToast = memo(function ConnectionToast() {
  const { isConnected, isReconnecting, connectionError, reconnectAttempt, queuedMessageCount } = useSocket();
  const previousConnectedState = useRef<boolean>(isConnected);
  const hasShownReconnectToast = useRef<boolean>(false);
  const hasShownErrorToast = useRef<boolean>(false);
  const { showError, showWarning, showSuccess } = useToast();

  // Stable reset function
  const resetFlags = useCallback(() => {
    hasShownErrorToast.current = false;
    hasShownReconnectToast.current = false;
  }, []);

  useEffect(() => {
    // Handle disconnection
    if (!isConnected && !isReconnecting && connectionError) {
      // Don't show if we were just initializing
      if (previousConnectedState.current && !hasShownErrorToast.current) {
        showError(
          `${connectionError}. Real-time features like messaging and notifications are unavailable. Reload page to retry.`,
          Infinity
        );
        hasShownErrorToast.current = true;
        hasShownReconnectToast.current = false;
      }
    }

    // Handle reconnection attempts
    if (isReconnecting && !isConnected && !hasShownReconnectToast.current) {
      let message = reconnectAttempt > 0
        ? `Reconnecting to server... (Attempt ${reconnectAttempt})`
        : 'Reconnecting to server...';

      // Add queued message info
      if (queuedMessageCount > 0) {
        message += ` (${queuedMessageCount} message${queuedMessageCount > 1 ? 's' : ''} queued)`;
      }

      showWarning(message, Infinity);
      hasShownReconnectToast.current = true;
      hasShownErrorToast.current = false;
    }

    // Handle successful reconnection
    if (isConnected && !isReconnecting) {
      // Show success toast only if we were previously disconnected
      if (previousConnectedState.current === false && connectionError) {
        let message = 'Connected to server! Real-time features are now active.';
        if (queuedMessageCount > 0) {
          message += ` Sending ${queuedMessageCount} queued message${queuedMessageCount > 1 ? 's' : ''}...`;
        }
        showSuccess(message, 3000);
        // Reset flags after successful connection
        setTimeout(resetFlags, 3000);
      } else {
        // Reset flags on successful connection
        resetFlags();
      }
    }

    // Update previous state
    previousConnectedState.current = isConnected;
  }, [isConnected, isReconnecting, connectionError, reconnectAttempt, queuedMessageCount, showError, showWarning, showSuccess, resetFlags]);

  return null; // This component doesn't render anything
});

export default ConnectionToast;
