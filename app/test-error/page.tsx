'use client';

import { useState } from 'react';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { Bomb } from 'lucide-react';

function BuggyComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('This is a test error to verify the Error Boundary works!');
  }

  return (
    <div className="space-y-4">
      <p className="text-lg">
        This component will throw an error when you click the button below.
      </p>
      <button
        onClick={() => setShouldError(true)}
        className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium inline-flex items-center space-x-2"
      >
        <Bomb className="h-5 w-5" />
        <span>Trigger Error</span>
      </button>
    </div>
  );
}

export default function TestErrorPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Error Boundary Test</h1>
          <p className="text-muted-foreground">
            This page tests the React Error Boundary implementation. Click the button below to trigger an error and see the fallback UI.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <ClientErrorBoundary>
            <BuggyComponent />
          </ClientErrorBoundary>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
          <h2 className="font-semibold mb-2">Expected Behavior:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click the "Trigger Error" button</li>
            <li>The component will throw a React error</li>
            <li>The Error Boundary catches the error</li>
            <li>You see a friendly error message with:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>An error icon</li>
                <li>User-friendly message</li>
                <li>"Try Again" button to reset the error</li>
                <li>"Go Home" button to navigate away</li>
                <li>Technical details (in development mode)</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
