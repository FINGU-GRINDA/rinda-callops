// Firebase Configuration Template
// Copy this file to src/lib/firebase/config.ts and fill in your values

export const firebaseConfig = {
  // Web Client Configuration
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: for Google Analytics
};

// Firebase Admin SDK Configuration (for server-side)
export const firebaseAdminConfig = {
  projectId: "YOUR_PROJECT_ID",
  privateKeyId: "YOUR_PRIVATE_KEY_ID",
  privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  clientEmail: "firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com",
  clientId: "YOUR_CLIENT_ID",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40YOUR_PROJECT_ID.iam.gserviceaccount.com"
};

/* 
Setup Instructions:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project or create a new one
3. Navigate to Project Settings (gear icon)

For Web Client Config:
- Under "Your apps", click "Add app" > Web icon
- Register your app with a nickname
- Copy the configuration object

For Admin SDK Config:
- Go to "Service accounts" tab
- Click "Generate new private key"
- Save the downloaded JSON file securely
- Extract the values from the JSON file

IMPORTANT: 
- Never commit actual configuration values to version control
- Use environment variables for production deployments
- Keep service account keys secure and rotate them regularly
*/