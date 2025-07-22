import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useAuthenticatedApi() {
  const { getIdToken } = useAuth();

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getIdToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error('Failed to make authenticated request:', error);
      throw error;
    }
  }, [getIdToken]);

  return { makeAuthenticatedRequest };
}