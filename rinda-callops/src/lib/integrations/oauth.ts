import { auth } from '@/lib/firebase/client';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  OAuthCredential 
} from 'firebase/auth';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
}

// Store OAuth tokens securely
const tokenStore = new Map<string, OAuthTokens>();

// Google OAuth provider with required scopes
export async function signInWithGoogle(scopes: string[] = []): Promise<OAuthTokens> {
  try {
    const provider = new GoogleAuthProvider();
    
    // Add default scopes
    provider.addScope('email');
    provider.addScope('profile');
    
    // Add additional scopes
    scopes.forEach(scope => provider.addScope(scope));
    
    // Request refresh token
    provider.setCustomParameters({
      access_type: 'offline',
      prompt: 'consent'
    });
    
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result) as OAuthCredential;
    
    if (credential?.accessToken) {
      const tokens: OAuthTokens = {
        accessToken: credential.accessToken,
        refreshToken: (result as any)._tokenResponse?.refreshToken,
        scope: (result as any)._tokenResponse?.scope
      };
      
      // Store tokens for reuse
      tokenStore.set('google', tokens);
      
      return tokens;
    }
    
    throw new Error('Failed to get access token');
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
}

// Get stored Google tokens
export function getGoogleTokens(): OAuthTokens | null {
  return tokenStore.get('google') || null;
}

// Specific Google service integrations
export async function connectGoogleCalendar(): Promise<OAuthTokens> {
  const tokens = getGoogleTokens();
  
  // If we already have tokens with calendar scope, reuse them
  if (tokens?.scope?.includes('calendar')) {
    return tokens;
  }
  
  // Otherwise, request calendar permissions
  return signInWithGoogle([
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]);
}

export async function connectGmail(): Promise<OAuthTokens> {
  const tokens = getGoogleTokens();
  
  // If we already have tokens with Gmail scope, reuse them
  if (tokens?.scope?.includes('gmail')) {
    return tokens;
  }
  
  // Otherwise, request Gmail permissions
  return signInWithGoogle([
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
  ]);
}

// Slack OAuth
export async function connectSlack(agentId: string): Promise<void> {
  const slackClientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/integrations/slack/callback`;
  
  const scopes = [
    'chat:write',
    'channels:read',
    'channels:join',
    'users:read',
    'team:read'
  ].join(',');
  
  const state = JSON.stringify({ agentId });
  
  const authUrl = `https://slack.com/oauth/v2/authorize?` +
    `client_id=${slackClientId}&` +
    `scope=${scopes}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${encodeURIComponent(state)}`;
  
  // Open Slack OAuth in popup
  const popup = window.open(authUrl, 'slack-auth', 'width=600,height=700');
  
  // Listen for completion
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkInterval);
        // Check if connection was successful
        const connected = localStorage.getItem('slack-connected');
        if (connected === 'true') {
          localStorage.removeItem('slack-connected');
          resolve();
        } else {
          reject(new Error('Slack connection cancelled'));
        }
      }
    }, 500);
  });
}

// Salesforce OAuth
export async function connectSalesforce(agentId: string): Promise<void> {
  const salesforceClientId = process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/integrations/salesforce/callback`;
  
  const authUrl = `https://login.salesforce.com/services/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${salesforceClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${encodeURIComponent(JSON.stringify({ agentId }))}`;
  
  // Open Salesforce OAuth in popup
  window.open(authUrl, 'salesforce-auth', 'width=600,height=700');
}

// HubSpot OAuth
export async function connectHubSpot(agentId: string): Promise<void> {
  const hubspotClientId = process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/integrations/hubspot/callback`;
  
  const scopes = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.companies.read',
    'crm.objects.companies.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write'
  ].join(' ');
  
  const authUrl = `https://app.hubspot.com/oauth/authorize?` +
    `client_id=${hubspotClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${encodeURIComponent(JSON.stringify({ agentId }))}`;
  
  // Open HubSpot OAuth in popup
  window.open(authUrl, 'hubspot-auth', 'width=600,height=700');
}