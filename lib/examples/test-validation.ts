#!/usr/bin/env tsx

/**
 * VALIDATION SYSTEM TEST
 * Run this to verify the custom validation system works correctly
 *
 * Usage: npx tsx frontend/lib/examples/test-validation.ts
 */

import {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validatePrice,
  validateLength,
  validateLoginForm,
  validateRegistrationForm,
  validateProductForm,
  validateCheckoutForm,
  validateContactForm,
  validateProfileUpdateForm,
  validatePasswordChangeForm,
  validateCategoryForm,
  getPasswordStrength,
  REGEX_PATTERNS,
  type ValidationResult,
} from '../validations-custom';

// ============================================================================
// TEST UTILITIES
// ============================================================================

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.error(error);
    failCount++;
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Expected true but got false');
  }
}

function assertFalse(condition: boolean, message?: string) {
  if (condition) {
    throw new Error(message || 'Expected false but got true');
  }
}

// ============================================================================
// TESTS
// ============================================================================

console.log('\n🧪 Testing Validation System\n');
console.log('='.repeat(60));

// ============================================================================
// Required Field Tests
// ============================================================================

console.log('\n📝 Testing validateRequired');

test('validateRequired - passes with non-empty value', () => {
  const result = validateRequired('test', 'Field');
  assertTrue(result.isValid);
});

test('validateRequired - fails with empty string', () => {
  const result = validateRequired('', 'Field');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('required'));
});

test('validateRequired - fails with whitespace only', () => {
  const result = validateRequired('   ', 'Field');
  assertFalse(result.isValid);
});

// ============================================================================
// Email Tests
// ============================================================================

console.log('\n📧 Testing validateEmail');

test('validateEmail - passes with valid email', () => {
  const result = validateEmail('user@example.com');
  assertTrue(result.isValid);
});

test('validateEmail - fails with invalid format', () => {
  const result = validateEmail('invalid-email');
  assertFalse(result.isValid);
});

test('validateEmail - fails with empty string', () => {
  const result = validateEmail('');
  assertFalse(result.isValid);
});

// ============================================================================
// Phone Tests
// ============================================================================

console.log('\n📱 Testing validatePhone');

test('validatePhone - passes with +254 format', () => {
  const result = validatePhone('+254712345678');
  assertTrue(result.isValid);
});

test('validatePhone - passes with 07 format', () => {
  const result = validatePhone('0712345678');
  assertTrue(result.isValid);
});

test('validatePhone - passes with 01 format', () => {
  const result = validatePhone('0112345678');
  assertTrue(result.isValid);
});

test('validatePhone - fails with invalid format', () => {
  const result = validatePhone('12345');
  assertFalse(result.isValid);
});

// ============================================================================
// Password Tests
// ============================================================================

console.log('\n🔐 Testing validatePassword');

test('validatePassword - passes with strong password', () => {
  const result = validatePassword('Password123!');
  assertTrue(result.isValid);
});

test('validatePassword - fails if too short', () => {
  const result = validatePassword('Pass1!');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('12 characters'));
});

test('validatePassword - fails without uppercase', () => {
  const result = validatePassword('password123!');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('uppercase'));
});

test('validatePassword - fails without lowercase', () => {
  const result = validatePassword('PASSWORD123!');
  assertFalse(result.isValid);
});

test('validatePassword - fails without number', () => {
  const result = validatePassword('Password!!');
  assertFalse(result.isValid);
});

test('validatePassword - fails without special char', () => {
  const result = validatePassword('Password123');
  assertFalse(result.isValid);
});

test('validatePasswordMatch - passes with matching passwords', () => {
  const result = validatePasswordMatch('Password123!', 'Password123!');
  assertTrue(result.isValid);
});

test('validatePasswordMatch - fails with non-matching passwords', () => {
  const result = validatePasswordMatch('Password123!', 'Different123!');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('do not match'));
});

// ============================================================================
// Password Strength Tests
// ============================================================================

console.log('\n💪 Testing getPasswordStrength');

test('getPasswordStrength - returns score 0 for empty password', () => {
  const strength = getPasswordStrength('');
  assertEqual(strength.score, 0);
});

test('getPasswordStrength - returns score 4 for strong password', () => {
  const strength = getPasswordStrength('Password123!');
  assertEqual(strength.score, 4);
  assertEqual(strength.label, 'Strong');
  assertEqual(strength.color, 'bg-green-500');
});

test('getPasswordStrength - tracks requirements', () => {
  const strength = getPasswordStrength('Password123!');
  assertTrue(strength.requirements.hasMinLength);
  assertTrue(strength.requirements.hasLowercase);
  assertTrue(strength.requirements.hasUppercase);
  assertTrue(strength.requirements.hasNumber);
  assertTrue(strength.requirements.hasSpecial);
});

// ============================================================================
// Price Tests
// ============================================================================

console.log('\n💰 Testing validatePrice');

test('validatePrice - passes with valid price', () => {
  const result = validatePrice('99.99');
  assertTrue(result.isValid);
});

test('validatePrice - passes with integer', () => {
  const result = validatePrice('100');
  assertTrue(result.isValid);
});

test('validatePrice - fails with zero', () => {
  const result = validatePrice('0');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('greater than 0'));
});

test('validatePrice - fails with invalid format', () => {
  const result = validatePrice('invalid');
  assertFalse(result.isValid);
});

// ============================================================================
// Length Tests
// ============================================================================

console.log('\n📏 Testing validateLength');

test('validateLength - passes with valid length', () => {
  const result = validateLength('Hello World', 5, 20, 'Name');
  assertTrue(result.isValid);
});

test('validateLength - fails if too short', () => {
  const result = validateLength('Hi', 5, 20, 'Name');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('at least 5'));
});

test('validateLength - fails if too long', () => {
  const result = validateLength('This is a very long name that exceeds maximum', 5, 20, 'Name');
  assertFalse(result.isValid);
  assertTrue(result.error?.includes('less than 20'));
});

// ============================================================================
// Form-Level Validation Tests
// ============================================================================

console.log('\n📋 Testing Form Validators');

test('validateLoginForm - passes with valid data', () => {
  const validation = validateLoginForm({
    email: 'user@example.com',
    password: 'Password123!',
  });
  assertTrue(validation.isValid);
  assertTrue(Object.keys(validation.errors).length === 0);
});

test('validateLoginForm - fails with invalid email', () => {
  const validation = validateLoginForm({
    email: 'invalid',
    password: 'Password123!',
  });
  assertFalse(validation.isValid);
  assertTrue(validation.errors.email?.includes('Invalid email'));
});

test('validateRegistrationForm - passes with valid data', () => {
  const validation = validateRegistrationForm({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'buyer',
    location: 'Nairobi',
  });
  assertTrue(validation.isValid);
});

test('validateRegistrationForm - fails with weak password', () => {
  const validation = validateRegistrationForm({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678',
    password: 'weak',
    confirmPassword: 'weak',
    role: 'buyer',
  });
  assertFalse(validation.isValid);
  assertTrue(validation.errors.password);
});

test('validateProductForm - passes with valid data', () => {
  const validation = validateProductForm({
    title: 'iPhone 13 Pro - Excellent Condition',
    description: 'This is a detailed description of the product that meets the minimum length requirement',
    price: '50000',
    category: 'category-id',
    condition: 'good',
    location: 'Nairobi',
    isNegotiable: true,
    images: ['image1.jpg', 'image2.jpg'],
  });
  assertTrue(validation.isValid);
});

test('validateProductForm - fails with invalid price', () => {
  const validation = validateProductForm({
    title: 'iPhone 13 Pro',
    description: 'Description here that is long enough',
    price: 'invalid',
    category: 'category-id',
    condition: 'good',
    location: 'Nairobi',
    isNegotiable: false,
    images: ['image1.jpg'],
  });
  assertFalse(validation.isValid);
  assertTrue(validation.errors.price);
});

test('validateCheckoutForm - passes with valid data', () => {
  const validation = validateCheckoutForm({
    phoneNumber: '0712345678',
    shippingAddress: {
      street: 'Main Street',
      building: 'Building 1',
      room: 'Room 123',
    },
  });
  assertTrue(validation.isValid);
});

test('validateContactForm - passes with valid data', () => {
  const validation = validateContactForm({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about product',
    message: 'This is a message that is long enough',
  });
  assertTrue(validation.isValid);
});

test('validatePasswordChangeForm - passes with valid data', () => {
  const validation = validatePasswordChangeForm({
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  });
  assertTrue(validation.isValid);
});

test('validateCategoryForm - passes with valid data', () => {
  const validation = validateCategoryForm({
    name: 'Electronics',
    description: 'Category for electronics',
    icon: '⚡',
    image: 'https://example.com/image.jpg',
    isActive: true,
  });
  assertTrue(validation.isValid);
});

// ============================================================================
// Regex Pattern Tests
// ============================================================================

console.log('\n🔍 Testing Regex Patterns');

test('REGEX_PATTERNS.email - matches valid emails', () => {
  assertTrue(REGEX_PATTERNS.email.test('user@example.com'));
  assertTrue(REGEX_PATTERNS.email.test('test.user+tag@domain.co.uk'));
});

test('REGEX_PATTERNS.email - rejects invalid emails', () => {
  assertFalse(REGEX_PATTERNS.email.test('invalid'));
  assertFalse(REGEX_PATTERNS.email.test('@example.com'));
  assertFalse(REGEX_PATTERNS.email.test('user@'));
});

test('REGEX_PATTERNS.phone - matches Kenyan phone numbers', () => {
  assertTrue(REGEX_PATTERNS.phone.test('+254712345678'));
  assertTrue(REGEX_PATTERNS.phone.test('0712345678'));
  assertTrue(REGEX_PATTERNS.phone.test('0112345678'));
});

test('REGEX_PATTERNS.phone - rejects invalid phone numbers', () => {
  assertFalse(REGEX_PATTERNS.phone.test('12345'));
  assertFalse(REGEX_PATTERNS.phone.test('071234567')); // too short
});

test('REGEX_PATTERNS.price - matches valid prices', () => {
  assertTrue(REGEX_PATTERNS.price.test('100'));
  assertTrue(REGEX_PATTERNS.price.test('99.99'));
  assertTrue(REGEX_PATTERNS.price.test('0.99'));
});

test('REGEX_PATTERNS.price - rejects invalid prices', () => {
  assertFalse(REGEX_PATTERNS.price.test('invalid'));
  assertFalse(REGEX_PATTERNS.price.test('99.999')); // too many decimals
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Summary\n');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📈 Total:  ${passCount + failCount}`);
console.log(`⚡ Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%\n`);

if (failCount === 0) {
  console.log('🎉 All tests passed! Validation system is working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
