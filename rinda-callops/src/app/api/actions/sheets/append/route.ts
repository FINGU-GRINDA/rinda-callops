import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, parameters, sheetId } = body;
    
    // Get the tool configuration from Firebase
    let googleSheetId = sheetId;
    let accessToken = null;
    let refreshToken = null;
    
    if (toolId) {
      const toolDoc = await db.collection('tools').doc(toolId).get();
      const toolData = toolDoc.data();
      
      if (toolData?.config) {
        googleSheetId = toolData.config.googleSheetId || sheetId;
        // In production, get tokens from secure storage
        // For now, try cookies
        const cookieStore = await cookies();
        accessToken = cookieStore.get('google_access_token')?.value;
        refreshToken = cookieStore.get('google_refresh_token')?.value;
      }
    }

    if (!googleSheetId) {
      return NextResponse.json(
        { error: 'No Google Sheet ID provided' },
        { status: 400 }
      );
    }

    // If we have Google authentication, use Google Sheets API
    if (accessToken) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // Handle order-specific operations
      if (parameters.items && parameters.customer_name) {
        // This is an order
        const orderId = `ORD-${Date.now()}`;
        const now = new Date();
        
        const values = [[
          orderId,
          now.toISOString().split('T')[0], // Date
          now.toTimeString().split(' ')[0], // Time
          parameters.customer_name || '',
          parameters.phone_number || '',
          JSON.stringify(parameters.items || []),
          parameters.total_amount || '',
          'New',
          parameters.delivery_address || '',
          parameters.notes || ''
        ]];

        await sheets.spreadsheets.values.append({
          spreadsheetId: googleSheetId,
          range: 'Orders!A:J',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values },
        });

        return NextResponse.json({
          success: true,
          order_id: orderId,
          message: `Order ${orderId} has been placed successfully`
        });
      } else {
        // Generic append
        const values = [[
          ...Object.values(parameters)
        ]];

        await sheets.spreadsheets.values.append({
          spreadsheetId: googleSheetId,
          range: 'Sheet1!A:Z',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values },
        });

        return NextResponse.json({ success: true });
      }
    } else {
      // Fallback: Store in Firestore
      const docRef = await db.collection('sheet_append_logs').add({
        googleSheetId,
        parameters,
        toolId,
        timestamp: new Date(),
        status: 'pending_auth'
      });

      return NextResponse.json({
        success: true,
        message: 'Data stored temporarily. Please connect Google Sheets to sync.',
        id: docRef.id
      });
    }
  } catch (error) {
    console.error('Sheet append error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to append data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}