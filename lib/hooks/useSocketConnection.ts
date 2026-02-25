'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';

/**
 * Hook to monitor socket connection state and execute callbacks on state changes
 *
 * @param options - Configuration options
 * @param options.onConnected - Callback when socket connects
 * @param options.onDisconnected - Callback when socket disconnects
 * @param options.onReconnecting - Callback when socket is reconnecting
 * @param options.onError - Callback when connection error occurs
 * @returns Connection state object
 *
 * @example
 * ```tsx
 * const { isConnected, isReconnecting, connectionError } = useSocketConnection({
 *   onConnected: () => console.log('Connected!'),
 *   onDisconnected: () => console.log('Disconnected'),
 * });
 * ```
 */
export function useSocketConnection(options?: {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: (attempt: number) => void;
  onError?: (error: string | null) => void;
}) {
  const { isConnected, isReconnecting, connectionError, reconnectAttempt } = useSocket();
  const previousStateRef = useRef({
    isConnected,
    isReconnecting,
    connectionError,
  });

  useEffect(() => {
    const prevState = previousStateRef.current;

    // Connection established
    if (isConnected && !prevState.isConnected && options?.onConnected) {
      options.onConnected();
    }

    // Disconnected
    if (!isConnected && !isReconnecting && prevState.isConnected && options?.onDisconnected) {
      options.onDisconnected();
    }

    // Started reconnecting
    if (isReconnecting && !prevState.isReconnecting && options?.onReconnecting) {
      options.onReconnecting(reconnectAttempt);
    }

    // Error changed
    if (connectionError !== prevState.connectionError && options?.onError) {
      options.onError(connectionError);
    }

    // Update previous state
    previousStateRef.current = {
      isConnected,
      isReconnecting,
      connectionError,
    };
  }, [isConnected, isReconnecting, connectionError, reconnectAttempt, options]);

  return {
    isConnected,
    isReconnecting,
    connectionError,
    reconnectAttempt,
  };
}

/**
 * Hook to automatically disable actions when socket is disconnected
 *
 * @param disabled - Additional disabled state
 * @returns Combined disabled state
 *
 * @example
 * ```tsx
 * const isDisabled = useSocketDisabled(false);
 * <button disabled={isDisabled}>Send Message</button>
 * ```
 */
export function useSocketDisabled(disabled?: boolean): boolean {
  const { isConnected, isReconnecting } = useSocket();

  return disabled || !isConnected || isReconnecting;
}

/**
 * Hook to show connection-dependent UI feedback
 *
 * @returns Object with connection state and UI helpers
 *
 * @example
 * ```tsx
 * const { statusText, statusColor, showWarning } = useSocketStatus();
 * ```
 */
export function useSocketStatus() {
  const { isConnected, isReconnecting, connectionError, reconnectAttempt, queuedMessageCount } = useSocket();

  const statusText = isConnected
    ? 'Connected'
    : isReconnecting
    ? `Reconnecting... (${reconnectAttempt})`
    : 'Disconnected';

  const statusColor = isConnected
    ? 'text-green-600'
    : isReconnecting
    ? 'text-yellow-600'
    : 'text-red-600';

  const showWarning = !isConnected || isReconnecting;

  return {
    isConnected,
    isReconnecting,
    connectionError,
    reconnectAttempt,
    queuedMessageCount,
    statusText,
    statusColor,
    showWarning,
  };
}

/**
 * Hook to queue messages when socket is disconnected
 *
 * @returns Object with emit function and queue state
 *
 * @example
 * ```tsx
 * const { emit, queuedCount } = useSocketQueue();
 * emit('message:new', { content: 'Hello' });
 * ```
 */
export function useSocketQueue() {
  const { emitWithQueue, queuedMessageCount, isConnected } = useSocket();

  return {
    emit: emitWithQueue,
    queuedCount: queuedMessageCount,
    isConnected,
  };
}
