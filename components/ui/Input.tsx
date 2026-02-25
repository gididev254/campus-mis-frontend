'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-foreground">
          {label}
          {props.required && (
            <span className="text-destructive ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        aria-required={props.required ? 'true' : undefined}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-destructive focus:ring-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
