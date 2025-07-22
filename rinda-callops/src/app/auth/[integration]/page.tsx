'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const integrationConfigs = {
  'calendar-integration': {
    name: 'Google Calendar',
    icon: '📅',
    scopes: ['https://www.googleapis.com/auth/calendar'],
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  'slack-notification': {
    name: 'Slack',
    icon: '💬',
    scopes: ['incoming-webhook', 'chat:write'],
    clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID,
    authUrl: 'https://slack.com/oauth/v2/authorize'
  },
  'crm-update': {
    name: 'Salesforce',
    icon: '☁️',
    scopes: ['api', 'refresh_token'],
    clientId: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID,
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize'
  }
};

export default function IntegrationAuthPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  
  const integration = params.integration as string;
  const config = integrationConfigs[integration as keyof typeof integrationConfigs];
  
  useEffect(() => {
    // Check if we have a code from OAuth callback
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      setStatus('error');
      setError(error);
      return;
    }
    
    if (code) {
      // Exchange code for token
      handleOAuthCallback(code);
    } else {
      // Redirect to OAuth provider
      initiateOAuth();
    }
  }, [integration, searchParams]);
  
  const initiateOAuth = () => {
    if (!config) {
      setStatus('error');
      setError('Unknown integration');
      return;
    }
    
    // For demo purposes, simulate successful connection
    setTimeout(() => {
      setStatus('success');
      // In production, redirect to OAuth provider
      // window.location.href = buildOAuthUrl(config);
    }, 2000);
  };
  
  const handleOAuthCallback = async (code: string) => {
    try {
      // In production, exchange code for token via backend
      // For demo, simulate success
      setTimeout(() => {
        setStatus('success');
        // Store connection status
        localStorage.setItem(`${integration}_connected`, 'true');
        
        // Close window after success
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'oauth-success', integration }, '*');
            window.close();
          }
        }, 1500);
      }, 1000);
    } catch (err) {
      setStatus('error');
      setError('Failed to complete authentication');
    }
  };
  
  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unknown Integration</h1>
          <p className="text-gray-600">This integration is not configured.</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-slate-800/90 border-gray-700">
        <div className="text-center">
          <div className="text-6xl mb-6">{config.icon}</div>
          
          {status === 'pending' && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Connecting to {config.name}
              </h1>
              <p className="text-gray-400">
                Please wait while we connect your account...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Successfully Connected!
              </h1>
              <p className="text-gray-400">
                Your {config.name} account has been connected.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                This window will close automatically...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Connection Failed
              </h1>
              <p className="text-gray-400 mb-6">
                {error || 'Something went wrong during authentication.'}
              </p>
              <Button 
                onClick={() => window.close()}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Close Window
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}