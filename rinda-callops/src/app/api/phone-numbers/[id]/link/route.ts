import { NextRequest, NextResponse } from 'next/server';

// POST /api/phone-numbers/[id]/link - Link phone number to agent
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Forward request to Python server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${serverUrl}/api/phone-numbers/${params.id}/link`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error linking phone number:', error);
    return NextResponse.json(
      { error: 'Failed to link phone number' },
      { status: 500 }
    );
  }
}