/**
 * API Client Configuration with Authentication
 * Uses the auto-generated client from @hey-api/openapi-ts
 */

import { client } from './api/client.gen';

// Configure the client with authentication
function setupAuth() {
  // Get auth token from localStorage or your auth provider
  const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  // Configure the client to automatically include auth headers
  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
    },
    // Add auth interceptor
    fetch: async (url: RequestInfo | URL, init?: RequestInit) => {
      const token = getAuthToken();
      
      if (token) {
        init = {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
          },
        };
      }
      
      return fetch(url, init);
    },
  });
}

// Initialize auth setup
setupAuth();

// Export the configured client and types
export { client } from './api/client.gen';
export type * from './api/types.gen';

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
};