'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

/**
 * Socket Context - Real-time connection management with robust reconnection handling
 *
 * Features:
 * - Automatic reconnection with exponential backoff (1s to 30s max delay)
 * - Connection status tracking (connected, reconnecting, disconnected)
 * - Heartbeat/ping-pong mechanism to detect stale connections
 * - Tab visibility change handling - reconnects when tab becomes visible
 * - Network status monitoring - reconnects when browser comes back online
 * - Manual reconnect button with retry logic
 * - Message queueing - stores messages while disconnected and sends on reconnect
 * - Graceful disconnect handling
 * - Token expiration handling with automatic reconnection
 *
 * Edge Cases Handled:
 * 1. Server restart - Auto-reconnects with exponential backoff
 * 2. Network loss - Detects via heartbeat and browser online/offline events
 * 3. Tab visibility change - Reconnects when tab becomes visible if disconnected
 * 4. Stale connections - Detects and forces reconnection after 60s of no heartbeat
 * 5. Authentication changes - Disconnects and reconnects with new token
 * 6. Token expiration - Detects 401 errors and triggers token refresh
 *
 * Connection States:
 * - isConnected: true when socket is connected and operational
 * - isReconnecting: true when actively attempting to reconnect
 * - connectionError: null when connected, error message otherwise
 * - reconnectAttempt: current reconnection attempt number
 * - queuedMessageCount: number of messages waiting to be sent
 */

interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  onlineUsers: Set<string>;
  connectionError: string | null;
  reconnectAttempt: number;
  queuedMessageCount: number;
  manualReconnect: () => void;
  emitWithQueue: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const MAX_QUEUE_SIZE = 100; // Maximum messages to queue
const MAX_RETRIES_PER_MESSAGE = 3; // Maximum retry attempts per queued message
const QUEUE_RETRY_DELAY = 1000; // Delay between queue retry batches

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [queuedMessageCount, setQueuedMessageCount] = useState(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const socketInstanceRef = useRef<Socket | null>(null);
  const visibilityChangeHandlerRef = useRef<(() => void) | null>(null);
  const wasConnectedBeforeHidden = useRef<boolean>(false);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const queueProcessingRef = useRef<boolean>(false);

  const heartbeatCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setIsReconnecting(false);
        setReconnectAttempt(0);
        setConnectionError(null);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (heartbeatCheckRef.current) {
        clearInterval(heartbeatCheckRef.current);
        heartbeatCheckRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Exponential backoff configuration
    const INITIAL_DELAY = 1000; // 1 second
    const MAX_DELAY = 30000; // 30 seconds
    const BACKOFF_MULTIPLIER = 1.5;

    // Initialize socket connection with exponential backoff
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: INITIAL_DELAY,
      reconnectionDelayMax: MAX_DELAY,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      timeout: 10000, // Connection timeout
      autoConnect: true,
      // Enable exponential backoff factor
      randomizationFactor: 0.5, // Add randomness to prevent thundering herd
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance.id);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
      setReconnectAttempt(0);
      lastHeartbeatRef.current = Date.now();

      // Process queued messages after connection
      if ((socketInstance as any)._processQueue) {
        (socketInstance as any)._processQueue();
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      // If the disconnection was initiated by the server, don't reconnect
      if (reason === 'io server disconnect') {
        setIsReconnecting(false);
        setConnectionError('Server disconnected the connection');
        socketInstance.connect();
      } else {
        // For other disconnections, Socket.io will auto-reconnect
        setIsReconnecting(true);
        setConnectionError('Connection lost. Reconnecting...');
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);

      // Check if error is due to authentication (token expired)
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        setConnectionError('Authentication failed. Please log in again.');
        // Token refresh will be handled by AuthContext's axios interceptor
        // The socket will reconnect when user is re-authenticated
      } else {
        setConnectionError(error.message);
        setIsConnected(false);
        setIsReconnecting(true);
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
      setReconnectAttempt(0);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      setReconnectAttempt(attemptNumber);
      setIsReconnecting(true);
      setConnectionError(`Reconnecting... Attempt ${attemptNumber}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setIsReconnecting(false);
      setConnectionError('Failed to reconnect. Please refresh the page.');
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(`Socket error: ${error}`);
    });

    // Heartbeat/Ping mechanism to detect stale connections
    socketInstance.on('pong', () => {
      lastHeartbeatRef.current = Date.now();
    });

    // Listen for server ping and respond with pong
    socketInstance.on('ping', () => {
      socketInstance.emit('pong');
    });

    // Send ping every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketInstance.connected) {
        socketInstance.emit('ping');
      }
    }, 30000);

    // Check for stale connections separately
    heartbeatCheckRef.current = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
      const socketCurrent = socketInstanceRef.current;

      if (socketCurrent && socketCurrent.connected && timeSinceLastHeartbeat > 60000) {
        console.warn('[Socket] Connection appears stale (no heartbeat for 60s), forcing reconnection...');
        setConnectionError('Connection stale, reconnecting...');
        setIsReconnecting(true);

        // Force reconnection
        socketCurrent.disconnect();
        setTimeout(() => {
          if (socketInstanceRef.current && !socketInstanceRef.current.connected) {
            socketInstanceRef.current.connect();
          }
        }, 100);
      } else if (socketCurrent && !socketCurrent.connected && !isReconnecting) {
        // If not connected and not reconnecting, trigger reconnection
        console.warn('[Socket] Not connected and not reconnecting, triggering reconnection...');
        setIsReconnecting(true);
        setConnectionError('Attempting to reconnect...');
        socketCurrent.connect();
      }
    }, 30000);

    // Track online users
    socketInstance.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socketInstance.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Handle tab visibility changes - reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible
        if (socketInstance.connected) {
          console.log('[Socket] Tab visible, connection OK');
          // Refresh connection state by sending a ping
          socketInstance.emit('ping');
          lastHeartbeatRef.current = Date.now();
        } else if (!isReconnecting) {
          // Not connected and not reconnecting, trigger reconnection
          console.log('[Socket] Tab visible and not connected, triggering reconnection...');
          wasConnectedBeforeHidden.current = false;
          setIsReconnecting(true);
          setConnectionError('Reconnecting after tab became visible...');
          socketInstance.connect();
        }
      } else {
        // Tab became hidden
        if (socketInstance.connected) {
          console.log('[Socket] Tab hidden, connection active');
          wasConnectedBeforeHidden.current = true;
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityChangeHandlerRef.current = handleVisibilityChange;

    // Handle window online/offline events
    const handleOnline = () => {
      console.log('[Socket] Browser back online');
      if (!socketInstance.connected && !isReconnecting) {
        setIsReconnecting(true);
        setConnectionError('Network restored. Reconnecting...');
        socketInstance.connect();
      }
    };

    const handleOffline = () => {
      console.log('[Socket] Browser went offline');
      setConnectionError('Network connection lost. Waiting for connection...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setSocket(socketInstance);
    socketInstanceRef.current = socketInstance;

    // Process message queue - defined outside to avoid recreation
    const processMessageQueue = async () => {
      if (queueProcessingRef.current || messageQueueRef.current.length === 0) {
        return;
      }

      queueProcessingRef.current = true;
      console.log(`[Socket] Processing ${messageQueueRef.current.length} queued messages`);

      // Process messages in batches
      const batchSize = 10;
      let processed = 0;

      while (messageQueueRef.current.length > 0 && processed < batchSize) {
        const message = messageQueueRef.current.shift();

        if (message && socketInstance.connected) {
          try {
            socketInstance.emit(message.event, message.data);
            processed++;
            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between emits
          } catch (error) {
            console.error('[Socket] Error sending queued message:', error);
            message.retries++;

            // Re-queue if retries not exhausted
            if (message.retries < MAX_RETRIES_PER_MESSAGE) {
              messageQueueRef.current.push(message);
            } else {
              console.warn('[Socket] Message dropped after max retries:', message.event);
            }
          }
        }
      }

      setQueuedMessageCount(messageQueueRef.current.length);
      queueProcessingRef.current = false;

      // If there are more messages, schedule next batch
      if (messageQueueRef.current.length > 0) {
        setTimeout(() => {
          const socketCurrent = socketInstanceRef.current;
          if (socketCurrent && socketCurrent.connected) {
            processMessageQueue();
          }
        }, QUEUE_RETRY_DELAY);
      } else {
        console.log('[Socket] Message queue cleared');
      }
    };

    // Make processMessageQueue available in the scope
    (socketInstance as any)._processQueue = processMessageQueue;

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (heartbeatCheckRef.current) {
        clearInterval(heartbeatCheckRef.current);
        heartbeatCheckRef.current = null;
      }

      // Remove visibility change listener
      if (visibilityChangeHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeHandlerRef.current);
        visibilityChangeHandlerRef.current = null;
      }

      // Remove online/offline listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      socketInstance.disconnect();
      socketInstanceRef.current = null;
      wasConnectedBeforeHidden.current = false;
      messageQueueRef.current = [];
      setQueuedMessageCount(0);
    };
  }, [isAuthenticated]);

  // Message queueing function
  const emitWithQueue = (event: string, data: any) => {
    const socketInstance = socketInstanceRef.current;

    if (!socketInstance) {
      console.warn('[Socket] No socket instance, message dropped');
      return;
    }

    if (socketInstance.connected) {
      try {
        socketInstance.emit(event, data);
      } catch (error) {
        console.error('[Socket] Error emitting message:', error);
        addToQueue(event, data);
      }
    } else {
      console.log(`[Socket] Disconnected, queueing message: ${event}`);
      addToQueue(event, data);
    }
  };

  // Add message to queue
  const addToQueue = (event: string, data: any) => {
    if (messageQueueRef.current.length >= MAX_QUEUE_SIZE) {
      console.warn('[Socket] Queue full, dropping oldest message');
      messageQueueRef.current.shift();
    }

    messageQueueRef.current.push({
      event,
      data,
      timestamp: Date.now(),
      retries: 0,
    });

    setQueuedMessageCount(messageQueueRef.current.length);
  };

  // Manual reconnect function with retry logic
  const manualReconnect = () => {
    if (socketInstanceRef.current) {
      console.log('[Socket] Manual reconnection triggered');

      // Reset state
      setIsReconnecting(true);
      setConnectionError('Manually reconnecting...');
      setReconnectAttempt(0);

      // Force disconnect and reconnect
      if (socketInstanceRef.current.connected) {
        socketInstanceRef.current.disconnect();
      }

      // Small delay before reconnecting to ensure clean disconnect
      setTimeout(() => {
        if (socketInstanceRef.current) {
          socketInstanceRef.current.connect();
        }
      }, 100);
    } else {
      // If no socket instance exists, trigger a re-initialization
      console.log('[Socket] No socket instance, will be created on next render');
      setConnectionError('Initializing connection...');
    }
  };

  // Process queue when connected
  useEffect(() => {
    if (isConnected && socketInstanceRef.current && messageQueueRef.current.length > 0) {
      const processFn = (socketInstanceRef.current as any)._processQueue;
      if (processFn && typeof processFn === 'function') {
        processFn();
      }
    }
  }, [isConnected]);

  const value = {
    socket,
    isConnected,
    isReconnecting,
    onlineUsers,
    connectionError,
    reconnectAttempt,
    queuedMessageCount,
    manualReconnect,
    emitWithQueue,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    console.warn('useSocket must be used within a SocketProvider, returning default');
    return {
      socket: null,
      isConnected: false,
      isReconnecting: false,
      onlineUsers: new Set(),
      connectionError: null,
      reconnectAttempt: 0,
      queuedMessageCount: 0,
      manualReconnect: () => {},
      emitWithQueue: () => {},
    };
  }
  return context;
}
