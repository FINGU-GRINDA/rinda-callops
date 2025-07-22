import { NextRequest, NextResponse } from 'next/server';

interface BusinessData {
  name: string;
  type: string;
  description: string;
  requirements?: string;
}

interface ToolConfiguration {
  menu?: string;
  menuItems?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    image?: string;
  }>;
  hours?: Record<string, string>;
  services?: string;
  doctors?: string[];
  stylists?: string[];
  [key: string]: any;
}

interface GenerateToolsRequest {
  businessData: BusinessData;
  toolConfiguration: ToolConfiguration;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateToolsRequest = await request.json();
    
    // Validate required fields
    if (!body.businessData?.name || !body.businessData?.type || !body.businessData?.description) {
      return NextResponse.json(
        { error: 'Missing required business data: name, type, description' },
        { status: 400 }
      );
    }

    // Forward the request to the Python backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/tools/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_type: body.businessData.type,
        business_name: body.businessData.name,
        business_description: body.businessData.description,
        requirements: body.businessData.requirements || 'Create tools for customer service and business operations',
        additional_data: body.toolConfiguration,
      }),
    });

    if (!response.ok) {
      console.error('Backend tool generation failed:', response.statusText);
      
      // Return fallback tools if backend fails
      const fallbackTools = getFallbackTools(body.businessData.type, body.toolConfiguration);
      return NextResponse.json({ tools: fallbackTools });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error generating tools:', error);
    
    // Return empty tools array on error
    return NextResponse.json({ 
      tools: [],
      error: 'Failed to generate tools' 
    }, { status: 500 });
  }
}

function getFallbackTools(businessType: string, config: ToolConfiguration) {
  const fallbackTools = [];

  if (businessType === 'restaurant' && config.menuItems && config.menuItems.length > 0) {
    // Create menu response from menu items
    const menuResponse = createMenuResponse(config.menuItems);
    
    fallbackTools.push({
      name: 'provide_menu',
      displayName: 'Provide Menu Information',
      description: 'Returns the complete restaurant menu with all items and prices. USE THIS TOOL ONLY WHEN: customer asks \'What\'s on the menu?\', \'What food do you have?\', \'What can I order?\', \'Do you have pizza?\', \'How much does X cost?\', \'What are your prices?\'. DO NOT USE THIS TOOL WHEN: customer wants to place an order.',
      type: 'function',
      enabled: true,
      configuration: {
        response: menuResponse,
        menuItems: config.menuItems,
      },
      json_schema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    });

    fallbackTools.push({
      name: 'take_order',
      displayName: 'Take Customer Order',
      description: 'Processes a customer\'s order after they have decided what to purchase. USE THIS TOOL ONLY WHEN: customer says \'I want to order X\', \'I\'ll have the X\', \'Can I get X\', or explicitly states they want to place an order. DO NOT USE THIS TOOL WHEN: customer is asking about menu items or prices.',
      type: 'function',
      enabled: true,
      json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            description: 'List of items being ordered',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the menu item' },
                quantity: { type: 'number', description: 'Quantity ordered' },
                price: { type: 'string', description: 'Price of the item' },
              },
              required: ['name', 'quantity'],
            },
          },
          customer_name: {
            type: 'string',
            description: 'Customer\'s name for the order',
          },
          phone_number: {
            type: 'string',
            description: 'Customer\'s phone number',
          },
          special_instructions: {
            type: 'string',
            description: 'Any special instructions for the order',
          },
        },
        required: ['items'],
        additionalProperties: false,
      },
    });
  }

  return fallbackTools;
}

function createMenuResponse(menuItems: ToolConfiguration['menuItems']): string {
  if (!menuItems || menuItems.length === 0) {
    return 'I\'d be happy to help you with our menu! However, it seems our menu information is being updated right now. Please let me check with the kitchen and get back to you with our current offerings.';
  }

  // Group items by category
  const categories = menuItems.reduce((acc, item) => {
    const category = item.category || 'Main Courses';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  let response = 'I\'d be happy to tell you about our delicious menu! ';
  
  Object.entries(categories).forEach(([category, items], index) => {
    if (index > 0) response += ' ';
    
    response += `For ${category.toLowerCase()}, we have `;
    
    items.forEach((item, itemIndex) => {
      if (itemIndex === items.length - 1 && items.length > 1) {
        response += 'and ';
      } else if (itemIndex > 0) {
        response += ', ';
      }
      
      response += item.name;
      if (item.price) response += ` at ${item.price}`;
      if (item.description) response += ` - ${item.description}`;
    });
    
    response += '.';
  });

  response += ' What sounds good to you today?';
  
  return response;
}