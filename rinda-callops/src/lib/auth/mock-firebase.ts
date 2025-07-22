// Mock Firebase Auth for development
// This file simulates Firebase Auth behavior without actual Firebase connection

export const MOCK_USER_ID = 'mock-user-123';
export const MOCK_TOKEN = 'mock-jwt-token-for-development';

export interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  exp: number;
  iat: number;
}

export const mockAuth = {
  verifyIdToken: async (token: string): Promise<DecodedToken> => {
    // In development, accept our mock token
    if (token === MOCK_TOKEN) {
      return {
        uid: MOCK_USER_ID,
        email: 'demo@rindacallops.com',
        email_verified: true,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
      };
    }
    
    throw new Error('Invalid token');
  }
};

// Mock Firestore for development
export const mockDb = {
  collection: (collectionName: string) => ({
    doc: (docId?: string) => ({
      get: async () => ({
        exists: true,
        id: docId || 'mock-doc-id',
        data: () => ({
          userId: MOCK_USER_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      }),
      set: async (data: any) => {},
      update: async (data: any) => {},
      delete: async () => {},
    }),
    add: async (data: any) => ({
      id: 'mock-doc-id-' + Date.now(),
    }),
    where: (field: string, operator: string, value: any) => ({
      get: async () => ({
        docs: [],
        empty: true,
      }),
      orderBy: (field: string, direction?: string) => ({
        limit: (limit: number) => ({
          get: async () => ({
            docs: [],
            empty: true,
          }),
          startAfter: (doc: any) => ({
            get: async () => ({
              docs: [],
              empty: true,
            }),
          }),
        }),
      }),
    }),
  }),
};