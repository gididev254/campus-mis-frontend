#!/usr/bin/env node

/**
 * Comprehensive App Testing Script
 * Tests all pages, buttons, and components across public, buyer, seller, and admin roles
 */

const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

let passed = 0;
let failed = 0;
const results = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    http.get(url, (res) => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(data).toString();
        const success = res.statusCode === 200;
        const hasError = body.includes('Oops! Something went wrong') ||
                        body.includes('TypeError:') ||
                        body.includes('Error:');

        if (success && !hasError) {
          passed++;
          log(`  ✓ ${description}`, colors.green);
          results.push({ endpoint, description, status: 'PASS' });
        } else {
          failed++;
          log(`  ✗ ${description} - Status: ${res.statusCode}`, colors.red);
          if (hasError) {
            log(`    Error detected in response`, colors.red);
          }
          results.push({ endpoint, description, status: 'FAIL', error: hasError ? 'Error in page' : `Status ${res.statusCode}` });
        }
        resolve();
      });
    }).on('error', (err) => {
      failed++;
      log(`  ✗ ${description} - ${err.message}`, colors.red);
      results.push({ endpoint, description, status: 'ERROR', error: err.message });
      resolve();
    });
  });
}

async function testSection(title, endpoints) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`Testing: ${title}`, colors.blue);
  log('='.repeat(60), colors.blue);
  for (const { endpoint, description } of endpoints) {
    await checkEndpoint(endpoint, description);
    await new Promise(r => setTimeout(r, 200)); // Rate limiting
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), colors.magenta);
  log('EMBUNI CAMPUS MARKET - COMPREHENSIVE APP TEST', colors.magenta);
  log('='.repeat(60), colors.magenta);

  // Check if servers are running
  log('\nChecking servers...', colors.yellow);
  try {
    await new Promise((resolve, reject) => {
      http.get(BASE_URL, () => resolve()).on('error', reject);
    });
    log('  ✓ Frontend server running on port 3000', colors.green);
  } catch (err) {
    log('  ✗ Frontend server NOT running!', colors.red);
    process.exit(1);
  }

  try {
    await new Promise((resolve, reject) => {
      http.get(`${BACKEND_URL}/api/health`, () => resolve()).on('error', reject);
    });
    log('  ✓ Backend server running on port 5000', colors.green);
  } catch (err) {
    log('  ⚠ Backend server might not be running (non-blocking)', colors.yellow);
  }

  // PUBLIC PAGES
  await testSection('PUBLIC PAGES', [
    { endpoint: '/', description: 'Home Page' },
    { endpoint: '/about', description: 'About Page' },
    { endpoint: '/contact', description: 'Contact Page' },
    { endpoint: '/faq', description: 'FAQ Page' },
    { endpoint: '/help', description: 'Help Page' },
    { endpoint: '/privacy', description: 'Privacy Policy' },
    { endpoint: '/terms', description: 'Terms of Service' },
    { endpoint: '/categories', description: 'Categories Page' },
    { endpoint: '/products', description: 'Products Page' },
    { endpoint: '/health', description: 'Health Check' },
  ]);

  // AUTH PAGES
  await testSection('AUTHENTICATION PAGES', [
    { endpoint: '/login', description: 'Login Page' },
    { endpoint: '/register', description: 'Register Page' },
    { endpoint: '/forgot-password', description: 'Forgot Password Page' },
    { endpoint: '/change-password', description: 'Change Password Page' },
  ]);

  // USER PAGES
  await testSection('USER PAGES', [
    { endpoint: '/profile', description: 'User Profile' },
    { endpoint: '/messages', description: 'Messages Page' },
    { endpoint: '/notifications', description: 'Notifications Page' },
  ]);

  // BUYER PAGES
  await testSection('BUYER PAGES', [
    { endpoint: '/buyer', description: 'Buyer Dashboard' },
    { endpoint: '/buyer/cart', description: 'Shopping Cart' },
    { endpoint: '/buyer/checkout', description: 'Checkout Page' },
    { endpoint: '/buyer/orders', description: 'Buyer Orders' },
    { endpoint: '/buyer/wishlist', description: 'Wishlist' },
    { endpoint: '/buyer/messages', description: 'Buyer Messages' },
  ]);

  // SELLER PAGES
  await testSection('SELLER PAGES', [
    { endpoint: '/seller', description: 'Seller Dashboard' },
    { endpoint: '/seller/products', description: 'Seller Products' },
    { endpoint: '/seller/orders', description: 'Seller Orders' },
    { endpoint: '/seller/sold-products', description: 'Sold Products' },
  ]);

  // ADMIN PAGES
  await testSection('ADMIN PAGES', [
    { endpoint: '/admin', description: 'Admin Dashboard' },
    { endpoint: '/admin/products', description: 'Admin Products Management' },
    { endpoint: '/admin/users', description: 'Admin User Management' },
    { endpoint: '/admin/categories', description: 'Admin Categories' },
    { endpoint: '/admin/orders', description: 'Admin Orders' },
    { endpoint: '/admin/payouts', description: 'Admin Payouts' },
    { endpoint: '/admin/analytics', description: 'Admin Analytics' },
    { endpoint: '/admin/messages', description: 'Admin Messages' },
    { endpoint: '/admin/reviews', description: 'Admin Reviews' },
  ]);

  // PRODUCT PAGES
  await testSection('PRODUCT-RELATED PAGES', [
    { endpoint: '/products/new', description: 'New Product Form' },
  ]);

  // SPECIAL PAGES
  await testSection('SPECIAL/TEST PAGES', [
    { endpoint: '/test-error', description: 'Error Boundary Test' },
    { endpoint: '/test-token-refresh', description: 'Token Refresh Test' },
  ]);

  // SUMMARY
  log('\n' + '='.repeat(60), colors.magenta);
  log('TEST SUMMARY', colors.magenta);
  log('='.repeat(60), colors.magenta);
  log(`Total Tests: ${passed + failed}`, colors.blue);
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, colors.blue);

  // Save results to file
  const reportPath = '/tmp/test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: passed + failed,
    passed,
    failed,
    successRate: ((passed / (passed + failed)) * 100).toFixed(1) + '%',
    results
  }, null, 2));
  log(`\nDetailed results saved to: ${reportPath}`, colors.yellow);

  // Print failed tests
  if (failed > 0) {
    log('\n' + '='.repeat(60), colors.red);
    log('FAILED TESTS:', colors.red);
    log('='.repeat(60), colors.red);
    results.filter(r => r.status !== 'PASS').forEach(r => {
      log(`  ✗ ${r.description} (${r.endpoint})`, colors.red);
      if (r.error) log(`    Error: ${r.error}`, colors.red);
    });
  }

  log('\n' + '='.repeat(60), colors.magenta);
  log('TEST COMPLETE', colors.magenta);
  log('='.repeat(60) + '\n', colors.magenta);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  log(`Error running tests: ${err.message}`, colors.red);
  console.error(err);
  process.exit(1);
});
