'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface FormErrorProps {
  error?: string;
  id?: string;
  className?: string;
}

export interface FormErrorsProps {
  errors?: Record<string, string>;
  className?: string;
}

export interface FieldWrapperProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

interface ReactElementProps {
  className?: string;
  id?: string;
  [key: string]: unknown;
}

// ============================================================================
// SINGLE ERROR DISPLAY
// ============================================================================

/**
 * FormError - Displays a single validation error message
 *
 * @param error - The error message to display
 * @param id - Optional ID for accessibility
 * @param className - Optional additional classes
 */
export function FormError({ error, id, className }: FormErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      className={cn(
        'mt-1.5 text-sm text-destructive flex items-start gap-1.5',
        'animate-in fade-in slide-in-from-top-1 duration-200',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

// ============================================================================
// MULTIPLE ERRORS DISPLAY
// ============================================================================

/**
 * FormErrors - Displays multiple form-level errors
 *
 * @param errors - Object with field names as keys and error messages as values
 * @param className - Optional additional classes
 */
export function FormErrors({ errors, className }: FormErrorsProps) {
  if (!errors || Object.keys(errors).length === 0) return null;

  const errorMessages = Object.values(errors);

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-destructive/10 border border-destructive/20',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-sm text-destructive">Please fix the following errors:</p>
          <ul className="space-y-1">
            {errorMessages.map((error, index) => (
              <li key={index} className="text-sm text-destructive flex items-start gap-2">
                <span className="flex-shrink-0" aria-hidden="true">
                  •
                </span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FIELD WRAPPER WITH ERROR
// ============================================================================

/**
 * FieldWrapper - Wraps form fields with label, error, and optional description
 * Automatically applies error styling to child inputs
 *
 * @param label - Field label
 * @param error - Validation error message
 * @param required - Whether the field is required
 * @param children - Form field component (input, select, textarea, etc.)
 * @param className - Optional additional classes
 * @param description - Optional helper text
 */
export function FieldWrapper({
  label,
  error,
  required,
  children,
  className,
  description,
}: FieldWrapperProps) {
  const fieldId = React.useId();
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  // Clone the child element and add error-related props
  const childWithProps = React.cloneElement(
    children as React.ReactElement<ReactElementProps>,
    {
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': [
        description ? descriptionId : null,
        error ? errorId : null,
      ]
        .filter(Boolean)
        .join(' '),
      ...(error && {
        className: cn(
          (children as React.ReactElement<ReactElementProps>).props.className,
          'border-destructive focus:border-destructive focus:ring-destructive'
        ),
      }),
    }
  );

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={(children as React.ReactElement<ReactElementProps>).props.id}
          className="block text-sm font-medium mb-1.5 text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </label>
      )}

      {childWithProps}

      {description && !error && (
        <p
          id={descriptionId}
          className="mt-1.5 text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-destructive flex items-start gap-1.5" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SUCCESS MESSAGE
// ============================================================================

interface FormSuccessProps {
  message: string;
  className?: string;
}

/**
 * FormSuccess - Displays a success message
 */
export function FormSuccess({ message, className }: FormSuccessProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-green-800 dark:text-green-400">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// INFO MESSAGE
// ============================================================================

interface FormInfoProps {
  message: string;
  className?: string;
}

/**
 * FormInfo - Displays an informational message
 */
export function FormInfo({ message, className }: FormInfoProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-blue-800 dark:text-blue-400">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// VALIDATION STATUS INDICATOR
// ============================================================================

interface ValidationStatusProps {
  isValid?: boolean;
  className?: string;
}

/**
 * ValidationStatus - Shows a visual indicator for field validation status
 */
export function ValidationStatus({ isValid, className }: ValidationStatusProps) {
  if (isValid === undefined) return null;

  return (
    <span className={cn('flex-shrink-0', className)} aria-hidden="true">
      {isValid ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertCircle className="h-5 w-5 text-destructive" />
      )}
    </span>
  );
}

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

/**
 * PasswordStrengthIndicator - Visual password strength meter with requirements
 */
export function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const {
    score,
    label,
    color,
    requirements,
  } = require('@/lib/validations-custom').getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={cn('mt-2 space-y-2', className)}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              level <= score ? color : 'bg-gray-200 dark:bg-gray-700'
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Strength label */}
      {label && (
        <p className="text-xs text-muted-foreground">
          Password strength:{' '}
          <span
            className={cn(
              'font-medium',
              score <= 1 && 'text-red-500',
              score === 2 && 'text-orange-500',
              score === 3 && 'text-yellow-600',
              score === 4 && 'text-green-600'
            )}
          >
            {label}
          </span>
        </p>
      )}

      {/* Requirements list */}
      {showRequirements && (
        <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-1.5">
          <p className="text-xs font-medium mb-2">Password Requirements:</p>
          <ul className="space-y-1 text-xs">
            <li
              className={cn(
                'flex items-center gap-2',
                requirements.hasMinLength
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              <span aria-hidden="true">{requirements.hasMinLength ? '✓' : '○'}</span>
              <span>At least 12 characters</span>
            </li>
            <li
              className={cn(
                'flex items-center gap-2',
                requirements.hasLowercase
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              <span aria-hidden="true">{requirements.hasLowercase ? '✓' : '○'}</span>
              <span>One lowercase letter (a-z)</span>
            </li>
            <li
              className={cn(
                'flex items-center gap-2',
                requirements.hasUppercase
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              <span aria-hidden="true">{requirements.hasUppercase ? '✓' : '○'}</span>
              <span>One uppercase letter (A-Z)</span>
            </li>
            <li
              className={cn(
                'flex items-center gap-2',
                requirements.hasNumber
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              <span aria-hidden="true">{requirements.hasNumber ? '✓' : '○'}</span>
              <span>One number (0-9)</span>
            </li>
            <li
              className={cn(
                'flex items-center gap-2',
                requirements.hasSpecial
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              <span aria-hidden="true">{requirements.hasSpecial ? '✓' : '○'}</span>
              <span>One special character (@$!%*?&)</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormError;
