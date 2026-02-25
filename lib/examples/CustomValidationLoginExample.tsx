'use client';

/**
 * EXAMPLE: Custom Validation Login Form
 * This is a reference implementation showing how to use custom form validation
 * without external libraries like react-hook-form or zod
 *
 * Copy the patterns from this file to implement validation in other forms
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { validateLoginForm, type ValidationResult } from '@/lib/validations-custom';
import { FormError, FormSuccess } from '@/components/ui/FormError';
import Button from '@/components/ui/Button';

// ============================================================================
// TYPES
// ============================================================================

interface LoginFormData {
  email: string;
  password: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CustomValidationLoginExample() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  // ============================================================================
  // INPUT HANDLERS
  // ============================================================================

  /**
   * Handle input change
   * - Updates form data
   * - Clears error for the field being edited
   * - Optionally validates in real-time
   */
  const handleChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Handle input blur
   * - Marks field as touched
   * - Validates the field
   */
  const handleBlur = (field: keyof LoginFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate single field
    const value = formData[field];
    let result: ValidationResult;

    switch (field) {
      case 'email':
        result = require('@/lib/validations-custom').validateEmail(value);
        break;
      case 'password':
        result = require('@/lib/validations-custom').validateRequired(value, 'Password');
        break;
      default:
        result = { isValid: true };
    }

    if (!result.isValid) {
      setErrors((prev) => ({ ...prev, [field]: result.error! }));
    }
  };

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  /**
   * Handle form submission
   * - Validates all fields
   * - Shows errors if validation fails
   * - Submits data if validation passes
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate entire form
    const validation = validateLoginForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear previous server errors
    setServerError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      // Show success message
      // toast.success('Successfully logged in!');

      // Redirect based on user role
      if (result.forcePasswordChange) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <div className="bg-card rounded-lg border p-8">
          {/* Server/General Error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                onBlur={handleBlur('email')}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  touched.email && errors.email
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-input'
                }`}
                aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              />
              <FormError id="email-error" error={touched.email ? errors.email : ''} />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password <span className="text-destructive">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password')(e.target.value)}
                onBlur={handleBlur('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  touched.password && errors.password
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-input'
                }`}
                aria-invalid={touched.password && errors.password ? 'true' : 'false'}
                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
              />
              <FormError id="password-error" error={touched.password ? errors.password : ''} />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded border-input" />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{' '}
            <Link
              href="/register"
              className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="font-medium mb-2">Need help?</p>
          <p>
            WhatsApp:{' '}
            <a
              href="https://wa.me/254111938368"
              className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              0111938368
            </a>
          </p>
          <p>
            Email:{' '}
            <a
              href="mailto:gedionmutua2024@gmail.com"
              className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded"
            >
              gedionmutua2024@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE GUIDE
// ============================================================================

/**
 * HOW TO USE CUSTOM VALIDATION:
 *
 * 1. Import validation functions:
 *    import { validateEmail, validateRequired } from '@/lib/validations-custom';
 *
 * 2. Create form state:
 *    const [formData, setFormData] = useState({ field: '' });
 *    const [errors, setErrors] = useState({});
 *    const [touched, setTouched] = useState({});
 *
 * 3. Handle input changes:
 *    const handleChange = (field) => (value) => {
 *      setFormData(prev => ({ ...prev, [field]: value }));
 *      // Clear error for this field
 *      setErrors(prev => {
 *        const newErrors = { ...prev };
 *        delete newErrors[field];
 *        return newErrors;
 *      });
 *    };
 *
 * 4. Handle blur (validate on blur):
 *    const handleBlur = (field) => () => {
 *      setTouched(prev => ({ ...prev, [field]: true }));
 *      const result = validateEmail(formData[field]);
 *      if (!result.isValid) {
 *        setErrors(prev => ({ ...prev, [field]: result.error }));
 *      }
 *    };
 *
 * 5. Handle submit:
 *    const handleSubmit = async (e) => {
 *      e.preventDefault();
 *      const validation = validateLoginForm(formData);
 *      if (!validation.isValid) {
 *        setErrors(validation.errors);
 *        return;
 *      }
 *      // Submit form
 *    };
 *
 * 6. Use FormError component:
 *    <FormError error={touched.field ? errors.field : ''} />
 */
