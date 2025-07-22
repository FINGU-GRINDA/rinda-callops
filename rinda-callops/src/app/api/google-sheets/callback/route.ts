import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase/admin';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-sheets/callback'
);

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (!code) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(`${baseUrl}/agents/new?error=no_code`);
    }

    // Get the token
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in cookies for immediate use
    const cookieStore = await cookies();
    cookieStore.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Also save tokens to Firebase for persistence
    try {
      // Save tokens with a generic key for now (we can improve this later)
      const tokenKey = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.collection('google_auth_tokens').doc(tokenKey).set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,  // Handle undefined refresh tokens
        expires_at: tokens.expiry_date,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`Saved Google tokens with key: ${tokenKey}`);
    } catch (dbError) {
      console.error('Error saving tokens to database:', dbError);
      // Don't fail the auth flow if DB save fails
    }

    // Return HTML that closes the popup and notifies parent
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Sheets Connected</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
            .success { color: #16a34a; font-size: 18px; margin-bottom: 10px; }
            .loading { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="success">✅ Successfully connected to Google Sheets!</div>
          <div class="loading">Closing window...</div>
          <script>
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'google-auth-success',
                success: true
              }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              // Fallback if popup was blocked - redirect to current page with success
              setTimeout(() => {
                window.location.href = '${decodeURIComponent(state || '')}' || '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/agents/new?google_connected=true';
              }, 1500);
            }
          </script>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error handling callback:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 50px;">
          <div style="color: #dc2626;">❌ Authentication failed</div>
          <div>Please close this window and try again.</div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'google-auth-error', error: true }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}