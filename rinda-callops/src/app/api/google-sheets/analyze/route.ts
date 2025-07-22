import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { sheetUrl, toolType } = await req.json();
    
    // Extract sheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL' },
        { status: 400 }
      );
    }
    
    const sheetId = sheetIdMatch[1];
    
    // Get tokens from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Google' },
        { status: 401 }
      );
    }

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

    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    // Get the first sheet's name
    const firstSheet = spreadsheet.data.sheets?.[0];
    const sheetName = firstSheet?.properties?.title || 'Sheet1';

    // Read the first 10 rows to analyze structure
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z10`,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Sheet is empty' },
        { status: 400 }
      );
    }

    // Use GPT-4 mini to analyze the sheet structure
    const analysisPrompt = toolType === 'orders' ? `
      Analyze this Google Sheets data for an order management system.
      
      Headers: ${JSON.stringify(rows[0])}
      Sample rows: ${JSON.stringify(rows.slice(1, 4))}
      
      Identify which columns map to these order fields:
      - customer_name: Customer's name
      - phone_number: Customer's phone
      - items: Order items (could be JSON, list, or description)
      - total_amount: Total price/amount
      - delivery_address: Delivery location
      - order_date: When the order was placed
      - order_status: Status of the order
      - notes: Any additional notes
      
      Return a JSON object with:
      {
        "columnMappings": {
          "customer_name": "column_name_in_sheet",
          "phone_number": "column_name_in_sheet",
          // ... etc
        },
        "detectedColumns": ["all", "column", "names"],
        "suggestedPrimaryKey": "column_that_could_be_order_id",
        "dataFormat": "description of how data is structured"
      }
    ` : `
      Analyze this Google Sheets data for a FAQ system.
      
      Headers: ${JSON.stringify(rows[0])}
      Sample rows: ${JSON.stringify(rows.slice(1, 4))}
      
      Identify which columns map to these FAQ fields:
      - question: The FAQ question
      - answer: The answer to the question
      - category: Category or topic
      - keywords: Search keywords (optional)
      
      Return a JSON object with:
      {
        "columnMappings": {
          "question": "column_name_in_sheet",
          "answer": "column_name_in_sheet",
          "category": "column_name_in_sheet"
        },
        "detectedColumns": ["all", "column", "names"],
        "dataFormat": "description of how data is structured"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst expert. Analyze spreadsheet structures and return valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Get all available sheets
    const availableSheets = spreadsheet.data.sheets?.map(sheet => ({
      name: sheet.properties?.title,
      id: sheet.properties?.sheetId
    })) || [];

    return NextResponse.json({
      sheetId,
      sheetName,
      availableSheets,
      headers: rows[0] || [],
      sampleData: rows.slice(1, 4),
      analysis,
      totalRows: rows.length
    });

  } catch (error) {
    console.error('Error analyzing sheet:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sheet' },
      { status: 500 }
    );
  }
}