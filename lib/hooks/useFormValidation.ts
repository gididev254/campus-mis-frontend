'use client';

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validate: (data: T) => { isValid: boolean; errors: Record<string, string> };
  onSubmit: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (value: string) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setError: (field: string, error: string) => void;
  clearErrors: () => void;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for form validation without external libraries
 * Provides form state management, validation, and error handling
 *
 * @param options - Configuration options
 * @returns Form state and handlers
 */
export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates a single field or the entire form
   */
  const validateField = useCallback(
    (field?: keyof T) => {
      if (field) {
        // Mark field as touched
        setTouched((prev) => ({ ...prev, [field as string]: true }));

        // Validate the entire form (since validation might depend on other fields)
        const result = validate(values);

        // Only update error for this field if it exists
        if (result.errors[field as string]) {
          setErrors((prev) => ({
            ...prev,
            [field as string]: result.errors[field as string],
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field as string];
            return newErrors;
          });
        }

        return !result.errors[field as string];
      } else {
        // Validate entire form
        const result = validate(values);
        setErrors(result.errors);
        return result.isValid;
      }
    },
    [values, validate]
  );

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (field: keyof T) => (value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });

      // Validate on change if enabled
      if (validateOnChange) {
        // Small delay to avoid validation on every keystroke
        setTimeout(() => validateField(field), 300);
      }
    },
    [validateOnChange, validateField]
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>
      );
      setTouched(allTouched);

      // Validate entire form
      const isValid = validateField();

      if (!isValid) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit, validateField]
  );

  /**
   * Set a specific error
   */
  const setError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setError,
    clearErrors,
    reset,
  };
}

// ============================================================================
// HELPER HOOK FOR SIMPLE VALIDATION
// ============================================================================

/**
 * Simplified hook for forms that only need basic validation
 */
export function useSimpleForm<T extends Record<string, string>>(
  initialValues: T,
  onSubmit: (data: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  };

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFieldError,
    handleSubmit,
    setValues,
  };
}
