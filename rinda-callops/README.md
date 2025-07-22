# RINDA CallOps - Frontend

RINDA CallOps is a powerful AI phone agent builder that allows businesses to create, configure, and deploy intelligent voice assistants. This is the frontend application built with Next.js and React.

## Features

### AI Phone Agent Builder
- **Visual Flow Builder**: Drag-and-drop interface for creating complex conversation flows
- **Form-Based Builder**: Step-by-step wizard for quick agent setup
- **Business Templates**: Pre-built templates for restaurants, medical offices, salons, retail, and real estate
- **AI-Powered Tool Generation**: Automatically generate tools from your business data

### Voice Configuration
- Multiple voice options (Ash, Ballad, Coral, Sage, Verse)
- Real-time voice testing
- Multi-language support (10+ languages)

### Business Data Integration
- File upload support for menus, services, and inventory
- Google Sheets integration for dynamic data management
- Vision API for analyzing uploaded documents
- Smart data extraction and tool generation

### Analytics & Management
- Real-time dashboard with call metrics
- Agent performance monitoring
- Call history and transcripts
- Revenue tracking and analytics

## Tech Stack

- **Framework**: Next.js 15.4.2 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Context API
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Animations**: Framer Motion
- **Flow Builder**: ReactFlow
- **Forms**: React Hook Form + Zod
- **API Client**: Auto-generated from OpenAPI spec

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Backend server running (see server README)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phone-ag/rinda-callops
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

### Required Environment Variables

```env
# Firebase Configuration (Web Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Backend Server
NEXT_PUBLIC_SERVER_URL=http://localhost:8000

# Optional: Google OAuth (for Sheets integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select existing
   - Enable Authentication and Firestore

2. **Enable Authentication**:
   - Navigate to Authentication > Sign-in method
   - Enable Email/Password provider
   - Add authorized domains (localhost for development)

3. **Set up Firestore**:
   - Navigate to Firestore Database
   - Create database in production mode
   - Copy the security rules from `firestore.rules`

4. **Get Web App Credentials**:
   - Go to Project Settings > General
   - Under "Your apps", click "Add app" > Web
   - Copy the configuration object

5. **Get Service Account Credentials**:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save the JSON file securely (never commit!)
   - Extract values for environment variables

6. **Deploy Firestore Rules and Indexes**:
```bash
npm install -g firebase-tools
firebase login

# Copy the example Firebase RC file and update with your project ID
cp .firebaserc.example .firebaserc
# Edit .firebaserc to add your project ID

firebase deploy --only firestore
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Generate API client (when backend API changes):
```bash
npm run generate-api
```

4. Watch mode for API generation:
```bash
npm run generate-api:watch
```

## Project Structure

```
rinda-callops/
 src/
    app/                    # Next.js app router pages
    components/             # React components
       agent-builder/      # Agent creation components
       dashboard/          # Dashboard components
       ui/                 # Reusable UI components
    contexts/               # React contexts
    hooks/                  # Custom React hooks
    lib/                    # Utility functions
       api/                # API client and utilities
       firebase/           # Firebase configuration
       utils/              # Helper functions
    types/                  # TypeScript type definitions
 public/                     # Static assets
 firebase.json               # Firebase configuration
 firestore.rules             # Firestore security rules
 firestore.indexes.json      # Firestore index definitions
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-api` - Generate TypeScript API client
- `npm run generate-api:watch` - Watch mode for API generation

## Features Guide

### Creating an Agent

1. **Quick Start**: Use the form-based builder for simple agents
2. **Advanced**: Use the visual flow builder for complex workflows
3. **Templates**: Start with a business-specific template

### Integrating Google Sheets

1. Click "Connect Google Sheets" in agent settings
2. Authenticate with Google
3. Select or create a spreadsheet
4. Map sheet columns to agent tools

### Testing Your Agent

1. Navigate to agent details page
2. Click "Test Agent" button
3. Use web interface or phone number for testing
4. Review call transcripts and analytics

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to your preferred platform:
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Self-hosted with Node.js

3. Set environment variables in your deployment platform

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**:
   - Verify Firebase configuration in environment variables
   - Check authorized domains in Firebase Console
   - Ensure Firestore rules allow access

2. **API Connection Issues**:
   - Verify backend server is running
   - Check NEXT_PUBLIC_SERVER_URL is correct
   - Look for CORS errors in browser console

3. **Google Sheets Integration**:
   - Ensure Google OAuth credentials are configured
   - Check redirect URIs in Google Cloud Console
   - Verify user has access to selected sheets

## Contributing

Please read the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
For questions, reach out to the development team.