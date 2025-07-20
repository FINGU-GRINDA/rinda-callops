import { BusinessData, Tool, FileUploadResult } from '../types';

interface SmartToolRequest {
  businessType: string;
  businessName: string;
  businessData: BusinessData;
  authToken: string;
}

interface FileAnalysisResult {
  content: string;
  insights: string[];
  categories: string[];
  specificItems: string[];
}

export async function generateSmartToolsFromBusinessData(
  request: SmartToolRequest
): Promise<Tool[]> {
  try {
    // Analyze uploaded files first
    const fileAnalysis = await analyzeUploadedFiles(request.businessData, request.authToken);
    
    // Generate AI-powered tools based on actual business content
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${serverUrl}/api/tools/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_type: request.businessType,
        business_name: request.businessName,
        business_data: request.businessData,
        file_analysis: fileAnalysis,
      }),
    });

    if (!response.ok) {
      console.error('Failed to generate smart tools:', response.statusText);
      // Fallback to simple template tools if AI generation fails
      return generateFallbackTools(request.businessType, request.businessData);
    }

    const result = await response.json();
    return result.tools || [];
  } catch (error) {
    console.error('Error generating smart tools:', error);
    return generateFallbackTools(request.businessType, request.businessData);
  }
}

async function analyzeUploadedFiles(
  businessData: BusinessData,
  authToken: string
): Promise<FileAnalysisResult> {
  const allFiles: FileUploadResult[] = [
    ...(businessData.menuFiles || []),
    ...(businessData.serviceFiles || []),
    ...(businessData.inventoryFiles || []),
    ...(businessData.listingFiles || []),
  ];

  if (allFiles.length === 0) {
    return {
      content: getTextContent(businessData),
      insights: [],
      categories: [],
      specificItems: []
    };
  }

  // Analyze each file with OpenAI Vision/Document analysis
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${serverUrl}/api/files/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: allFiles,
        text_content: getTextContent(businessData),
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('File analysis failed:', error);
  }

  // Fallback to text content only
  return {
    content: getTextContent(businessData),
    insights: [],
    categories: [],
    specificItems: []
  };
}

function getTextContent(businessData: BusinessData): string {
  const textParts: string[] = [];
  
  if (typeof businessData.menu === 'string' && businessData.menu) {
    textParts.push(`Menu: ${businessData.menu}`);
  }
  
  if (typeof businessData.services === 'string' && businessData.services) {
    textParts.push(`Services: ${businessData.services}`);
  }
  
  if (businessData.products) {
    textParts.push(`Products: ${businessData.products}`);
  }
  
  if (typeof businessData.listings === 'string' && businessData.listings) {
    textParts.push(`Listings: ${businessData.listings}`);
  }
  
  if (businessData.stylists) {
    textParts.push(`Staff: ${businessData.stylists}`);
  }
  
  if (businessData.doctors) {
    textParts.push(`Doctors: ${businessData.doctors}`);
  }
  
  if (businessData.agents) {
    textParts.push(`Agents: ${businessData.agents}`);
  }
  
  if (businessData.additionalInfo) {
    textParts.push(`Additional Info: ${businessData.additionalInfo}`);
  }

  return textParts.join('\n\n');
}

// Fallback to simple template tools if AI generation fails
function generateFallbackTools(businessType: string, businessData: BusinessData): Tool[] {
  const tools: Tool[] = [];

  if (businessType === 'restaurant') {
    tools.push({
      name: 'check_menu_availability',
      description: 'Check if specific menu items are available',
      type: 'function',
      enabled: true,
      json_schema: {
        type: 'object',
        properties: {
          item: { type: 'string', description: 'Menu item to check' }
        },
        required: ['item']
      }
    });
  }

  // Add basic tools for other business types...
  tools.push({
    name: 'get_business_info',
    description: 'Get general business information',
    type: 'function',
    enabled: true,
    json_schema: {
      type: 'object',
      properties: {
        info_type: { type: 'string', description: 'Type of information needed' }
      },
      required: ['info_type']
    }
  });

  return tools;
}