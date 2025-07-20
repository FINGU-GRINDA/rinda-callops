import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/actions/sheets/append - Append data to a sheet (simulated with Firestore for now)
export async function POST(request: NextRequest) {
  try {
    // This endpoint is called by Vapi webhooks, so we don't require auth
    const body = await request.json();
    
    // Extract data from the request
    const {
      sheetId,
      sheetName = 'Sheet1',
      data,
      metadata = {}
    } = body;

    // For now, we'll store in Firestore
    // In production, this would integrate with Google Sheets API
    const sheetData = {
      sheetId: sheetId || 'default',
      sheetName,
      data,
      metadata,
      source: 'vapi_webhook',
      timestamp: FieldValue.serverTimestamp(),
      createdAt: new Date()
    };

    // Store in a generic collection based on the action type
    const collectionName = metadata.actionType || 'sheet_append_logs';
    const docRef = await db.collection(collectionName).add(sheetData);

    // Return success response that Vapi expects
    return NextResponse.json({
      success: true,
      message: 'Data appended successfully',
      id: docRef.id,
      data: {
        ...sheetData,
        id: docRef.id
      }
    });
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