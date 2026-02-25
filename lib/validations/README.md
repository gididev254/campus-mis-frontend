# Campus Market Form Validation System

Complete custom form validation system for Campus Market frontend - **no external libraries required**.

## Quick Links

- [Quick Reference](#quick-reference)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Documentation](#api-documentation)
- [Examples](#examples)
- [Testing](#testing)
- [Migration Guide](#migration-guide)

## Quick Reference

```typescript
// Import validation functions
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateLoginForm,
} from '@/lib/validations';

// Use them
const result = validateEmail('user@example.com');
if (!result.isValid) {
  console.log(result.error); // 'Invalid email address'
}

// Validate entire forms
const validation = validateLoginForm(formData);
if (!validation.isValid) {
  setErrors(validation.errors);
}
```

## Installation

The validation system is already included in the project. No additional installation needed.

### Files

- **`/lib/validations-custom.ts`** - Core validation functions (600+ lines)
- **`/lib/validations.ts`** - Re-exports (includes Zod for backward compatibility)
- **`/components/ui/FormError.tsx`** - Error display components (350+ lines)
- **`/lib/hooks/useFormValidation.ts`** - Custom form hook (200+ lines)
- **`/lib/examples/CustomValidationLoginExample.tsx`** - Working example
- **`/lib/examples/test-validation.ts`** - Test suite

## Basic Usage

### 1. Field-Level Validation

```tsx
import { useState } from 'react';
import { validateEmail } from '@/lib/validations';
import { FormError } from '@/components/ui/FormError';

function MyForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    const result = validateEmail(email);
    if (!result.isValid) {
      setError(result.error!);
    }
  };

  const handleChange = (value: string) => {
    setEmail(value);
    setError(''); // Clear error when typing
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
      <FormError error={touched ? error : ''} />
    </div>
  );
}
```

### 2. Form-Level Validation

```tsx
import { validateRegistrationForm } from '@/lib/validations';

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit form
    submitForm(formData);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## API Documentation

### Field Validators

#### `validateRequired(value, fieldName?)`

Checks if a field is not empty.

```typescript
const result = validateRequired('test', 'Email');
// { isValid: true }
```

#### `validateEmail(value)`

Validates email format.

```typescript
const result = validateEmail('user@example.com');
// { isValid: true }

const result = validateEmail('invalid');
// { isValid: false, error: 'Invalid email address' }
```

#### `validatePhone(value)`

Validates Kenyan phone numbers.

**Valid formats:**
- `+254712345678`
- `0712345678`
- `0112345678`

```typescript
const result = validatePhone('0712345678');
// { isValid: true }
```

#### `validatePassword(value)`

Validates password strength.

**Requirements:**
- Minimum 12 characters
- 1 lowercase letter (a-z)
- 1 uppercase letter (A-Z)
- 1 number (0-9)
- 1 special character (@$!%*?&)

```typescript
const result = validatePassword('Password123!');
// { isValid: true }
```

#### `validatePasswordMatch(password, confirmPassword)`

Validates that passwords match.

```typescript
const result = validatePasswordMatch('Pass123!', 'Pass123!');
// { isValid: true }
```

#### `validatePrice(value)`

Validates price format.

**Format:** Positive number with up to 2 decimal places

```typescript
const result = validatePrice('99.99');
// { isValid: true }
```

#### `validateLength(value, min, max, fieldName?)`

Validates length is within range.

```typescript
const result = validateLength('Hello', 2, 10, 'Name');
// { isValid: true }
```

### Form Validators

#### `validateLoginForm(data)`

```typescript
validateLoginForm({
  email: string,
  password: string
})
```

#### `validateRegistrationForm(data)`

```typescript
validateRegistrationForm({
  name: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  role: 'buyer' | 'seller',
  location?: string
})
```

#### `validateProductForm(data)`

```typescript
validateProductForm({
  title: string,
  description: string,
  price: string,
  category: string,
  condition: 'new' | 'like-new' | 'good' | 'fair',
  location: string,
  isNegotiable: boolean,
  images: string[]
})
```

#### `validateCheckoutForm(data)`

```typescript
validateCheckoutForm({
  phoneNumber: string,
  shippingAddress: {
    street: string,
    building: string,
    room: string
  }
})
```

### Password Strength Checker

#### `getPasswordStrength(password)`

Returns detailed password strength information.

```typescript
const strength = getPasswordStrength('Password123!');

// {
//   score: 4,           // 0-4 scale
//   label: 'Strong',    // Weak | Fair | Good | Strong
//   color: 'bg-green-500',
//   requirements: {
//     hasMinLength: true,
//     hasLowercase: true,
//     hasUppercase: true,
//     hasNumber: true,
//     hasSpecial: true
//   }
// }
```

## Components

### FormError

Displays a single error message.

```tsx
<FormError error={errors.email} id="email-error" />
```

### FormErrors

Displays multiple form-level errors.

```tsx
<FormErrors errors={validation.errors} />
```

### FieldWrapper

Wraps a field with label, error, and description.

```tsx
<FieldWrapper
  label="Email"
  error={errors.email}
  required
  description="We'll never share your email"
>
  <input id="email" type="email" />
</FieldWrapper>
```

### PasswordStrengthIndicator

Shows password strength meter with requirements.

```tsx
<PasswordStrengthIndicator
  password={formData.password}
  showRequirements={true}
/>
```

### FormSuccess

Displays a success message.

```tsx
<FormSuccess message="Changes saved successfully!" />
```

## Examples

See `/lib/examples/CustomValidationLoginExample.tsx` for a complete working example.

## Testing

Run the test suite:

```bash
npx tsx frontend/lib/examples/test-validation.ts
```

This will verify all validation functions work correctly.

## Regex Patterns

Access regex patterns directly:

```typescript
import { REGEX_PATTERNS } from '@/lib/validations';

REGEX_PATTERNS.email       // Email validation
REGEX_PATTERNS.phone       // Kenyan phone numbers
REGEX_PATTERNS.passwordLowercase
REGEX_PATTERNS.passwordUppercase
REGEX_PATTERNS.passwordNumber
REGEX_PATTERNS.passwordSpecial
REGEX_PATTERNS.price       // Price format
REGEX_PATTERNS.url         // URL format
```

## Migration Guide

### From React Hook Form + Zod

**Before:**
```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});

<input {...register('email')} />
<FormError error={errors.email?.message} />
```

**After:**
```tsx
const [formData, setFormData] = useState({ email: '' });
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

<input
  value={formData.email}
  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
  onBlur={() => {
    setTouched(prev => ({ ...prev, email: true }));
    const result = validateEmail(formData.email);
    if (!result.isValid) setErrors(prev => ({ ...prev, email: result.error }));
  }}
/>
<FormError error={touched.email ? errors.email : ''} />
```

## Best Practices

1. **Clear errors on input** - Remove error when user starts typing
2. **Show errors after blur** - Don't show errors until user leaves field
3. **Validate on submit** - Final validation check before submission
4. **Use touched state** - Only show errors after field is touched
5. **Provide clear messages** - Tell user what's wrong and how to fix
6. **Mark required fields** - Use asterisk (*) for required fields
7. **Test validation** - Use the test suite to verify validation works

## Accessibility

All components include full accessibility support:

- `aria-invalid` - Indicates field validity
- `aria-describedby` - Links field to error message
- `role="alert"` - Announces errors to screen readers
- `aria-live="polite"` - Error announcement timing
- Keyboard navigation
- Focus indicators

## Performance

- ✅ No external dependencies (~80KB bundle savings)
- ✅ Lightweight regex-based validation
- ✅ Efficient re-renders
- ✅ Debounced real-time validation
- ✅ Memoized handlers

## Documentation

- **[Full Guide](../../../../docs/FORM-VALIDATION-GUIDE.md)** - Complete documentation
- **[Quick Reference](../../../../docs/FORM-VALIDATION-QUICK-REF.md)** - Quick lookup
- **[Integration Guide](../../../../docs/FORM-VALIDATION-INTEGRATION.md)** - Step-by-step integration
- **[Summary](../../../../FORM-VALIDATION-IMPLEMENTATION-SUMMARY.md)** - Implementation overview

## Support

For issues or questions:
1. Check the documentation above
2. Review the example implementation
3. Run the test suite
4. Check existing forms using the system

## License

Part of the Campus Market project.
