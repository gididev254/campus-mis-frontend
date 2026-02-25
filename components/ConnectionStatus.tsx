'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Wifi, WifiOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConnectionStatus - Visual indicator for real-time connection state
 *
 * Displays:
 * - Green (Online): Connected and operational
 * - Yellow (Reconnecting): Attempting to reconnect
 * - Red (Offline): Disconnected or connection failed
 *
 * Features:
 * - Click to show detailed connection information
 * - Manual reconnect button when disconnected
 * - Shows reconnection attempt count
 * - Displays error messages
 */
export default function ConnectionStatus() {
  const { isConnected, isReconnecting, connectionError, reconnectAttempt, manualReconnect, queuedMessageCount } = useSocket();
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Don't show anything if not initialized (no connection attempt yet)
  if (!isConnected && !isReconnecting && !connectionError) {
    return null;
  }

  const getStatusText = () => {
    if (isConnected) return 'Online';
    if (isReconnecting) {
      return reconnectAttempt > 0 ? `Reconnecting... (${reconnectAttempt})` : 'Reconnecting...';
    }
    if (connectionError) return 'Offline';
    return 'Connecting...';
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-3.5 w-3.5" />;
    if (isReconnecting) return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    return <WifiOff className="h-3.5 w-3.5" />;
  };

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    if (isReconnecting) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all duration-300 border cursor-pointer hover:scale-105',
          getStatusColor()
        )}
        onClick={() => setShowTooltip(!showTooltip)}
        title={connectionError || 'Click for connection details'}
      >
        {getStatusIcon()}
        <span className="hidden sm:inline font-medium">{getStatusText()}</span>
      </div>

      {/* Tooltip with detailed information */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 rounded-lg shadow-lg bg-popover border text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Connection Status</span>
            </div>

            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={cn(
                  'font-medium',
                  isConnected ? 'text-green-600' : 'text-red-600'
                )}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {isReconnecting && reconnectAttempt > 0 && (
                <div className="flex justify-between">
                  <span>Attempt:</span>
                  <span className="font-medium text-yellow-600">#{reconnectAttempt}</span>
                </div>
              )}

              {queuedMessageCount > 0 && (
                <div className="flex justify-between">
                  <span>Queued Messages:</span>
                  <span className="font-medium text-blue-600">{queuedMessageCount}</span>
                </div>
              )}

              {connectionError && (
                <div className="pt-2 border-t">
                  <div className="font-medium text-red-600 mb-1">Error:</div>
                  <div className="text-[10px] break-words">{connectionError}</div>
                </div>
              )}

              {!isConnected && (
                <div className="pt-2 border-t space-y-2">
                  <div className="text-[10px] space-y-1">
                    <p className="font-medium text-foreground">Troubleshooting:</p>
                    <ul className="space-y-0.5 text-muted-foreground">
                      <li>• Check your internet connection</li>
                      <li>• Verify the server is running</li>
                      <li>• Try refreshing the page</li>
                    </ul>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      manualReconnect();
                      setShowTooltip(false);
                    }}
                    disabled={isReconnecting}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      isReconnecting
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    )}
                  >
                    {isReconnecting ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Reconnect Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
