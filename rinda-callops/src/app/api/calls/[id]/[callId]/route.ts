import { NextRequest, NextResponse } from 'next/server';

// GET /api/calls/[id]/[callId] - Get call details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; callId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward request to Python server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${serverUrl}/api/calls/${params.id}/${params.callId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching call details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call details' },
      { status: 500 }
    );
  }
}