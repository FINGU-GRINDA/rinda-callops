# Firebase Setup Guide for RINDA CallOps

This guide walks you through setting up Firebase for the RINDA CallOps application.

## Prerequisites

- Google account
- Basic understanding of Firebase services
- Access to create a new Firebase project or admin access to existing project

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or select existing project
3. Enter project name (e.g., "phone-agents")
4. Enable Google Analytics (optional)
5. Select analytics account or create new one
6. Click "Create project"

## Step 2: Enable Required Services

### Enable Authentication

1. In Firebase Console, navigate to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Enable Firestore Database

1. Navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location (closest to your users)
5. Click "Enable"

## Step 3: Get Web App Configuration

1. Go to Project Settings (gear icon) > General
2. Scroll to "Your apps" section
3. Click "Add app" > Web icon (</>) 
4. Register app with a nickname (e.g., "RINDA CallOps Web")
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXX"
};
```

## Step 4: Get Service Account Credentials

1. Go to Project Settings > Service accounts
2. Make sure "Firebase Admin SDK" is selected
3. Click "Generate new private key"
4. Click "Generate key" in the warning dialog
5. Save the downloaded JSON file securely
6. **IMPORTANT**: This file contains sensitive credentials. Never commit it to version control!

## Step 5: Configure Firestore Security Rules

1. Navigate to Firestore Database > Rules
2. Replace default rules with the content from `rinda-callops/firestore.rules`
3. Click "Publish"

## Step 6: Deploy Firestore Indexes

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the frontend directory:
```bash
cd rinda-callops
firebase init firestore
```

4. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Step 7: Set Up Environment Variables

### Frontend (.env.local)

Create `rinda-callops/.env.local`:

```env
# Firebase Web Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXX

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

### Backend (.env)

Create `server/.env` with the same Firebase Admin SDK values:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

## Step 8: Configure Authentication Settings

1. Go to Authentication > Settings
2. Under "Authorized domains", add:
   - `localhost` (for development)
   - Your production domain(s)
3. Click "Save"

## Step 9: Set Up Google OAuth (for Sheets Integration)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (or create new)
3. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-domain.com/api/auth/google/callback`
   - Save client ID and secret

## Step 10: Verify Setup

### Test Frontend Connection

1. Start the frontend:
```bash
cd rinda-callops
npm run dev
```

2. Open browser console and check for Firebase initialization messages
3. Try creating a test account

### Test Backend Connection

1. Start the backend:
```bash
cd server
python main.py
```

2. Check logs for successful Firebase connection
3. Test an API endpoint that requires authentication

## Troubleshooting

### Common Issues

1. **"Permission Denied" errors**
   - Check Firestore security rules
   - Verify service account has correct IAM roles
   - Ensure authentication is properly set up

2. **"Invalid API key" errors**
   - Double-check all Firebase configuration values
   - Ensure no extra spaces or quotes in .env files
   - Verify project ID matches across all configs

3. **"CORS error" when calling backend**
   - Add your frontend URL to CORS settings
   - Check Firebase authorized domains

4. **Service account key issues**
   - Ensure private key has proper line breaks (\n)
   - Verify JSON format is valid
   - Check file permissions

## Security Best Practices

1. **Never commit credentials**
   - Add .env files to .gitignore
   - Use environment variables in production
   - Rotate keys regularly

2. **Use least privilege**
   - Create specific service accounts for different services
   - Grant minimal required permissions
   - Review IAM roles regularly

3. **Monitor usage**
   - Enable audit logs
   - Set up billing alerts
   - Monitor for unusual activity

4. **Secure your rules**
   - Test Firestore rules thoroughly
   - Use Firebase Auth for all data access
   - Validate data on both client and server

## Production Deployment

1. Use environment variables or secret management service
2. Enable Firebase App Check for additional security
3. Set up monitoring and alerting
4. Configure backup and disaster recovery
5. Review and tighten security rules

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)