import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { templateType, businessName } = await req.json();
    
    // Get tokens from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('google_access_token')?.value;
    const refreshToken = (await cookieStore).get('google_refresh_token')?.value;

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
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    let spreadsheet;
    
    if (templateType === 'orders') {
      // Create orders template
      spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${businessName} - Orders`,
          },
          sheets: [{
            properties: {
              title: 'Orders',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10,
              },
            },
            data: [{
              startRow: 0,
              startColumn: 0,
              rowData: [{
                values: [
                  { userEnteredValue: { stringValue: 'Order ID' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                  { userEnteredValue: { stringValue: 'Time' } },
                  { userEnteredValue: { stringValue: 'Customer Name' } },
                  { userEnteredValue: { stringValue: 'Phone Number' } },
                  { userEnteredValue: { stringValue: 'Items' } },
                  { userEnteredValue: { stringValue: 'Total Amount' } },
                  { userEnteredValue: { stringValue: 'Status' } },
                  { userEnteredValue: { stringValue: 'Delivery Address' } },
                  { userEnteredValue: { stringValue: 'Notes' } },
                ],
              }],
            }],
          }],
        },
      });

      // Get the sheet ID from the created spreadsheet
      const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;
      
      // Format the header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet.data.spreadsheetId!,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat',
            },
          }],
        },
      });
    } else if (templateType === 'faq') {
      // Create FAQ template
      spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${businessName} - FAQ`,
          },
          sheets: [{
            properties: {
              title: 'FAQ',
              gridProperties: {
                rowCount: 100,
                columnCount: 3,
              },
            },
            data: [{
              startRow: 0,
              startColumn: 0,
              rowData: [{
                values: [
                  { userEnteredValue: { stringValue: 'Question' } },
                  { userEnteredValue: { stringValue: 'Answer' } },
                  { userEnteredValue: { stringValue: 'Category' } },
                ],
              }],
            }],
          }],
        },
      });

      // Get the sheet ID from the created spreadsheet  
      const faqSheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;
      
      // Format the header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet.data.spreadsheetId!,
        requestBody: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: faqSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.4 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat',
            },
          }],
        },
      });

      // Add sample FAQ entries
      await sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheet.data.spreadsheetId!,
        range: 'FAQ!A2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            ['What are your hours?', 'We are open Monday-Friday 9AM-5PM', 'Hours'],
            ['Do you offer delivery?', 'Yes, we offer delivery within a 5-mile radius', 'Delivery'],
            ['What payment methods do you accept?', 'We accept cash, credit cards, and mobile payments', 'Payment'],
          ],
        },
      });
    }

    // Make the spreadsheet publicly readable
    if (spreadsheet?.data.spreadsheetId) {
      await drive.permissions.create({
        fileId: spreadsheet.data.spreadsheetId,
        requestBody: {
          type: 'anyone',
          role: 'reader',
        },
        
      });
    }

    return NextResponse.json({
      spreadsheetId: spreadsheet?.data.spreadsheetId,
      spreadsheetUrl: spreadsheet?.data.spreadsheetUrl,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}