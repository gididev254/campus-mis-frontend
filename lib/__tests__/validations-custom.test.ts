/**
 * Validation Functions Tests
 */

import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateLength,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validatePrice,
  validateURL,
  getPasswordStrength,
  REGEX_PATTERNS,
  type ValidationResult,
} from '../validations-custom';

describe('Validation Functions', () => {
  describe('validateRequired', () => {
    test('should pass validation for non-empty string', () => {
      const result = validateRequired('test value');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should fail validation for empty string', () => {
      const result = validateRequired('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('This field is required');
    });

    test('should fail validation for whitespace-only string', () => {
      const result = validateRequired('   ');
      expect(result.isValid).toBe(false);
    });

    test('should fail validation for undefined value', () => {
      const result = validateRequired(undefined as any);
      expect(result.isValid).toBe(false);
    });

    test('should fail validation for null value', () => {
      const result = validateRequired(null as any);
      expect(result.isValid).toBe(false);
    });

    test('should use custom field name in error message', () => {
      const result = validateRequired('', 'Email');
      expect(result.error).toBe('Email is required');
    });
  });

  describe('validateMinLength', () => {
    test('should pass validation for string meeting minimum length', () => {
      const result = validateMinLength('abcdef', 5);
      expect(result.isValid).toBe(true);
    });

    test('should pass validation for string exactly at minimum length', () => {
      const result = validateMinLength('abcde', 5);
      expect(result.isValid).toBe(true);
    });

    test('should fail validation for string below minimum length', () => {
      const result = validateMinLength('abc', 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be at least 5 characters');
    });

    test('should fail required check for empty string', () => {
      const result = validateMinLength('', 5);
      expect(result.isValid).toBe(false);
    });

    test('should use custom field name in error message', () => {
      const result = validateMinLength('abc', 5, 'Password');
      expect(result.error).toBe('Password must be at least 5 characters');
    });

    test('should trim whitespace before checking length', () => {
      const result = validateMinLength('  abc  ', 5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    test('should pass validation for string within maximum length', () => {
      const result = validateMaxLength('abc', 5);
      expect(result.isValid).toBe(true);
    });

    test('should pass validation for string exactly at maximum length', () => {
      const result = validateMaxLength('abcde', 5);
      expect(result.isValid).toBe(true);
    });

    test('should fail validation for string exceeding maximum length', () => {
      const result = validateMaxLength('abcdef', 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be less than 5 characters');
    });

    test('should pass validation for empty string', () => {
      const result = validateMaxLength('', 5);
      expect(result.isValid).toBe(true);
    });

    test('should use custom field name in error message', () => {
      const result = validateMaxLength('abcdef', 5, 'Name');
      expect(result.error).toBe('Name must be less than 5 characters');
    });

    test('should trim whitespace before checking length', () => {
      const result = validateMaxLength('  abcdef  ', 5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateLength', () => {
    test('should pass validation for string within range', () => {
      const result = validateLength('abcde', 3, 10);
      expect(result.isValid).toBe(true);
    });

    test('should pass validation for string at minimum boundary', () => {
      const result = validateLength('abc', 3, 10);
      expect(result.isValid).toBe(true);
    });

    test('should pass validation for string at maximum boundary', () => {
      const result = validateLength('abcdefghij', 3, 10);
      expect(result.isValid).toBe(true);
    });

    test('should fail validation for string below minimum', () => {
      const result = validateLength('ab', 3, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be at least 3 characters');
    });

    test('should fail validation for string above maximum', () => {
      const result = validateLength('abcdefghijk', 3, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Must be less than 10 characters');
    });

    test('should use custom field name in error message', () => {
      const result = validateLength('ab', 3, 10, 'Username');
      expect(result.error).toBe('Username must be at least 3 characters');
    });
  });

  describe('validateEmail', () => {
    test('should pass validation for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    test('should fail validation for invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@domain',
        'user..name@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid email address');
      });
    });

    test('should fail validation for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    test('should trim whitespace before validation', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    test('should pass validation for valid Kenyan phone numbers', () => {
      const validPhones = [
        '+254712345678',
        '+254723456789',
        '0712345678',
        '0723456789',
        '0112345678',
        '0123456789',
      ];

      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
      });
    });

    test('should fail validation for invalid phone numbers', () => {
      const invalidPhones = [
        '12345',
        '+254612345678', // Invalid prefix (6 instead of 7 or 1)
        '0812345678', // Invalid prefix (8 instead of 7 or 1)
        'abc1234567',
        '+25471234567', // Too short
        '+2547123456789', // Too long
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid phone number');
      });
    });

    test('should fail validation for empty phone', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    test('should trim whitespace before validation', () => {
      const result = validatePhone('  0712345678  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    test('should pass validation for strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
    });

    test('should fail validation for password less than 12 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 12 characters');
    });

    test('should fail validation for password without uppercase', () => {
      const result = validatePassword('alllowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('uppercase letter');
    });

    test('should fail validation for password without lowercase', () => {
      const result = validatePassword('ALLUPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('lowercase letter');
    });

    test('should fail validation for password without number', () => {
      const result = validatePassword('NoNumbersHere!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('number');
    });

    test('should fail validation for password without special character', () => {
      const result = validatePassword('NoSpecialChars123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('special character');
    });

    test('should fail validation for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('validatePasswordMatch', () => {
    test('should pass validation for matching passwords', () => {
      const result = validatePasswordMatch('Password123!', 'Password123!');
      expect(result.isValid).toBe(true);
    });

    test('should fail validation for non-matching passwords', () => {
      const result = validatePasswordMatch('Password123!', 'Different123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });

    test('should be case-sensitive', () => {
      const result = validatePasswordMatch('Password123!', 'password123!');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePrice', () => {
    test('should pass validation for valid prices', () => {
      const validPrices = ['100', '99.99', '0.99', '1000', '50.5'];

      validPrices.forEach(price => {
        const result = validatePrice(price);
        expect(result.isValid).toBe(true);
      });
    });

    test('should fail validation for invalid prices', () => {
      const invalidPrices = [
        '-100',
        'abc',
        '100.999', // More than 2 decimal places
        '',
      ];

      invalidPrices.forEach(price => {
        const result = validatePrice(price);
        expect(result.isValid).toBe(false);
      });
    });

    test('should fail validation for empty price', () => {
      const result = validatePrice('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Price is required');
    });

    test('should fail validation for zero price', () => {
      const result = validatePrice('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Price must be greater than 0');
    });
  });

  describe('validateURL', () => {
    test('should pass validation for valid URLs', () => {
      const validURLs = [
        'http://example.com',
        'https://example.com',
        'https://www.example.com',
        'https://example.com/path',
        'https://example.com?query=value',
      ];

      validURLs.forEach(url => {
        const result = validateURL(url);
        expect(result.isValid).toBe(true);
      });
    });

    test('should fail validation for invalid URLs', () => {
      const invalidURLs = [
        'example.com',
        'ftp://example.com',
        '',
        'not a url',
      ];

      invalidURLs.forEach(url => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    test('should fail validation for empty URL when required', () => {
      const result = validateURL('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is required');
    });
  });

  describe('getPasswordStrength', () => {
    test('should return strong for password meeting all requirements', () => {
      const strength = getPasswordStrength('StrongPass123!');
      expect(strength).toBe('strong');
      expect(strength.score).toBeGreaterThanOrEqual(4);
    });

    test('should return weak for very short password', () => {
      const strength = getPasswordStrength('Short1!');
      expect(strength.label).toBe('weak');
    });

    test('should return weak for password without numbers', () => {
      const strength = getPasswordStrength('NoNumbersHere!');
      expect(strength.label).toBe('weak');
    });

    test('should return weak for password without special characters', () => {
      const strength = getPasswordStrength('NoSpecialChars123');
      expect(strength.label).toBe('weak');
    });

    test('should return medium for moderately strong password', () => {
      const strength = getPasswordStrength('MediumPass123!');
      expect(strength.label).toBe('medium');
    });
  });

  describe('REGEX_PATTERNS', () => {
    test('email pattern should match valid emails', () => {
      expect(REGEX_PATTERNS.email.test('test@example.com')).toBe(true);
      expect(REGEX_PATTERNS.email.test('user.name@example.co.uk')).toBe(true);
      expect(REGEX_PATTERNS.email.test('invalid')).toBe(false);
    });

    test('phone pattern should match Kenyan phone numbers', () => {
      expect(REGEX_PATTERNS.phone.test('+254712345678')).toBe(true);
      expect(REGEX_PATTERNS.phone.test('0712345678')).toBe(true);
      expect(REGEX_PATTERNS.phone.test('12345')).toBe(false);
    });

    test('password patterns should work correctly', () => {
      expect(REGEX_PATTERNS.passwordLowercase.test('a')).toBe(true);
      expect(REGEX_PATTERNS.passwordLowercase.test('A')).toBe(false);

      expect(REGEX_PATTERNS.passwordUppercase.test('A')).toBe(true);
      expect(REGEX_PATTERNS.passwordUppercase.test('a')).toBe(false);

      expect(REGEX_PATTERNS.passwordNumber.test('5')).toBe(true);
      expect(REGEX_PATTERNS.passwordNumber.test('a')).toBe(false);

      expect(REGEX_PATTERNS.passwordSpecial.test('@')).toBe(true);
      expect(REGEX_PATTERNS.passwordSpecial.test('a')).toBe(false);
    });

    test('price pattern should match valid prices', () => {
      expect(REGEX_PATTERNS.price.test('100')).toBe(true);
      expect(REGEX_PATTERNS.price.test('99.99')).toBe(true);
      expect(REGEX_PATTERNS.price.test('99.999')).toBe(false);
      expect(REGEX_PATTERNS.price.test('-100')).toBe(false);
    });

    test('url pattern should match valid URLs', () => {
      expect(REGEX_PATTERNS.url.test('https://example.com')).toBe(true);
      expect(REGEX_PATTERNS.url.test('http://example.com')).toBe(true);
      expect(REGEX_PATTERNS.url.test('example.com')).toBe(false);
    });

    test('kenyaId pattern should match 8-digit IDs', () => {
      expect(REGEX_PATTERNS.kenyaId.test('12345678')).toBe(true);
      expect(REGEX_PATTERNS.kenyaId.test('1234567')).toBe(false);
      expect(REGEX_PATTERNS.kenyaId.test('123456789')).toBe(false);
    });
  });
});
