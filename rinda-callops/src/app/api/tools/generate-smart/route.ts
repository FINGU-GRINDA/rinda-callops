import { NextRequest, NextResponse } from 'next/server';

// POST /api/tools/generate-smart - Generate tools using AI
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/tools/generate-smart - Generating tools:', JSON.stringify(body, null, 2));

    // Forward request to Python server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
    console.log(`POST /api/tools/generate-smart - Forwarding to: ${serverUrl}`);
    
    try {
      const response = await fetch(`${serverUrl}/api/tools/generate-smart`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000) // 30 second timeout for AI generation
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`POST /api/tools/generate-smart - Python server error: ${response.status}`, data);
        return NextResponse.json(data, { status: response.status });
      }

      console.log('POST /api/tools/generate-smart - Successfully generated tools');
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('POST /api/tools/generate-smart - Python server connection failed:', fetchError);
      
      // Return mock tools as fallback
      const mockTools = [{
        name: body.business_type === 'restaurant' ? 'get_menu_info' : 'get_business_info',
        display_name: body.business_type === 'restaurant' ? 'Get Menu Information' : 'Get Business Information',
        description: body.business_description || 'Get information about the business',
        type: 'function',
        enabled: true,
        json_schema: {
          type: 'function',
          function: {
            name: body.business_type === 'restaurant' ? 'get_menu_info' : 'get_business_info',
            description: body.business_description || 'Get information about the business',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'What information to retrieve'
                }
              },
              required: ['query']
            }
          }
        }
      }];
      
      console.log('POST /api/tools/generate-smart - Returning mock tools as fallback');
      return NextResponse.json({ tools: mockTools });
    }

  } catch (error) {
    console.error('POST /api/tools/generate-smart - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to generate tools', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}