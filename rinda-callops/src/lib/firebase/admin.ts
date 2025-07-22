import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { mockAuth, mockDb } from '@/lib/auth/mock-firebase';

// Check if we have Firebase credentials
const hasFirebaseCredentials = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_CLIENT_EMAIL && 
                               process.env.FIREBASE_PRIVATE_KEY;

let app: App | null = null;
let db: any;
let auth: any;

if (hasFirebaseCredentials) {
  // Use real Firebase when credentials are available
  console.log('🔥 Using real Firebase with project:', process.env.FIREBASE_PROJECT_ID);
  
  if (!getApps().length) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Fall back to mock implementations
  console.log('🔧 Using mock Firebase for development');
  db = mockDb;
  auth = mockAuth;
}

export { db, auth, app as adminApp };