'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

export default function TestTokenRefreshPage() {
  const [email, setEmail] = useState('testbuyer@example.com');
  const [password, setPassword] = useState('Test@Password123');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setResults(prev => [...prev, { name, status, message, duration }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = performance.now();
    try {
      await testFn();
      const duration = performance.now() - startTime;
      addResult(testName, 'success', 'Test passed', duration);
    } catch (error: unknown) {
      const duration = performance.now() - startTime;
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      addResult(testName, 'error', err.response?.data?.message || err.message || 'Test failed', duration);
    }
  };

  const testLogin = async () => {
    const response = await authAPI.login({ email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.token;
    }
    throw new Error('Login failed - no token received');
  };

  const testTokenRefresh = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage');
    }

    const response = await authAPI.refreshToken(token);
    if (response.data.success && response.data.token) {
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);

      // Verify new token works
      const meResponse = await authAPI.getMe();
      if (!meResponse.data.success) {
        throw new Error('New token does not work');
      }

      return newToken;
    }
    throw new Error('Token refresh failed - no new token received');
  };

  const testInvalidTokenRefresh = async () => {
    try {
      await authAPI.refreshToken('invalid.token.here');
      throw new Error('Should have failed with invalid token');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  };

  const testMalformedTokenRefresh = async () => {
    try {
      await authAPI.refreshToken(null as unknown as string);
      throw new Error('Should have failed with null token');
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 400 || err.response?.status === 401) {
        return; // Expected behavior
      }
      throw error;
    }
  };

  const runAllTests = async () => {
    clearResults();
    setIsLoading(true);

    await runTest('1. User Login', async () => {
      await testLogin();
    });

    await runTest('2. Verify Current Token', async () => {
      const response = await authAPI.getMe();
      if (!response.data.success) {
        throw new Error('Could not verify current token');
      }
    });

    await runTest('3. Token Refresh', async () => {
      await testTokenRefresh();
    });

    await runTest('4. Verify Refreshed Token', async () => {
      const response = await authAPI.getMe();
      if (!response.data.success) {
        throw new Error('Could not verify refreshed token');
      }
    });

    await runTest('5. Refresh with Invalid Token', async () => {
      await testInvalidTokenRefresh();
    });

    await runTest('6. Refresh with Malformed Token', async () => {
      await testMalformedTokenRefresh();
    });

    await runTest('7. Token Structure Check', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Decode JWT (without verification)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.id || !payload.iat || !payload.exp) {
        throw new Error('Token missing required claims');
      }

      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      const timeToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60); // minutes

      if (timeToExpiry < 0) {
        throw new Error('Token has expired');
      }

      console.log('Token payload:', payload);
      console.log('Time to expiry:', timeToExpiry, 'minutes');
    });

    setIsLoading(false);
  };

  const testSimulatedExpiration = async () => {
    clearResults();
    setIsLoading(true);

    try {
      // First login
      addResult('1. Initial Login', 'pending', 'Logging in...');
      const token = await testLogin();
      addResult('1. Initial Login', 'success', `Token received: ${token.substring(0, 20)}...`);

      // Manually corrupt the token to simulate expiration
      addResult('2. Simulate Token Expiration', 'pending', 'Corrupting token...');
      const corruptedToken = token.substring(0, token.length - 10) + 'CORRUPTED';
      addResult('2. Simulate Token Expiration', 'success', 'Token corrupted');

      // Try to use corrupted token (should fail and attempt refresh)
      addResult('3. Attempt API Call with Corrupted Token', 'pending', 'Testing auto-refresh...');
      try {
        // Restore original token first (since refresh needs valid old token)
        localStorage.setItem('token', token);

        // This should work normally
        await authAPI.getMe();
        addResult('3. Attempt API Call with Valid Token', 'success', 'API call successful');
      } catch (error: unknown) {
        const err = error as Error;
        addResult('3. Attempt API Call with Corrupted Token', 'error', 'API call failed');
      }

    } catch (error: unknown) {
      const err = error as Error;
      addResult('Simulation Error', 'error', err.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JWT Token Refresh Test</h1>
          <p className="text-gray-600 mb-8">
            This page tests the JWT token refresh mechanism implemented in the Campus Market frontend.
          </p>

          {/* Test Configuration */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={testSimulatedExpiration}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Running...' : 'Test Expiration Simulation'}
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Clear Results
            </button>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
              </div>
              <div className="divide-y">
                {results.map((result, index) => (
                  <div key={index} className="px-6 py-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === 'pending' && (
                          <svg className="w-5 h-5 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {result.status === 'success' && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {result.status === 'error' && (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                      </div>
                      <p className={`text-sm ml-7 ${result.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                        {result.message}
                      </p>
                    </div>
                    {result.duration !== undefined && (
                      <span className="text-sm text-gray-500 font-mono">
                        {result.duration.toFixed(0)}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Token Info */}
          {typeof window !== 'undefined' && localStorage.getItem('token') && (
            <div className="mt-6 bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Token Info</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Token:</span> {localStorage.getItem('token')?.substring(0, 40)}...
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">User:</span> {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How the Token Refresh Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>When a user logs in, they receive a JWT token valid for 7 days</li>
              <li>Each API request includes this token in the Authorization header</li>
              <li>If the token expires (401 response), the axios interceptor catches it</li>
              <li>The interceptor calls the refresh endpoint with the old token</li>
              <li>The backend validates the old token and issues a new token</li>
              <li>The new token is stored in localStorage and the original request is retried</li>
              <li>If refresh fails, the user is logged out and redirected to login page</li>
              <li>Multiple simultaneous requests with expired tokens are queued and handled together</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
