'use client';

import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, your data is safe.
            You can try again or go back to the home page.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Technical Details
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              <p className="font-mono text-destructive break-words">
                {error.toString()}
              </p>
              {error.stack && (
                <pre className="font-mono text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        </div>

        {/* Support Message */}
        <p className="text-center text-sm text-muted-foreground">
          If this problem persists, please{' '}
          <a href="/contact" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

export default ErrorFallback;
