import { Tool, ToolParameter } from '@/types/models';
import { v4 as uuidv4 } from 'uuid';

// Tool creation request interface
interface CreateToolRequest {
  function: FunctionDefinition;
  server: {
    url: string;
    secret: string;
  };
}

// Function definition interface
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolGenerationContext {
  businessType?: string;
  businessName: string;
  businessDescription: string;
  customRequirements?: string;
  industry?: string;
  description?: string;
  services?: string[];
  existingTools?: string[];
}

export class ToolGenerator {
  private static getBaseWebhookUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  static async generateToolsFromDescription(
    context: ToolGenerationContext
  ): Promise<CreateToolRequest[]> {
    try {
      const response = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          businessName: context.businessName,
          industry: context.industry || context.businessType || 'General',
          description: context.description || context.businessDescription,
          existingTools: context.existingTools
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate tools');
      }

      const { tools } = await response.json();

      return tools.map((tool: FunctionDefinition) => ({
        type: 'function' as const,
        function: tool
      }));
    } catch (error) {
      console.error('Error generating tools:', error);
      // Fallback to basic keyword-based generation
      return this.generateBasicTools(context);
    }
  }

  private static async getAuthToken(): Promise<string> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  }

  static generateBasicTools(context: ToolGenerationContext): CreateToolRequest[] {
    const tools: CreateToolRequest[] = [];
    const baseUrl = this.getBaseWebhookUrl();
    const description = context.businessDescription.toLowerCase();
    const requirements = context.customRequirements?.toLowerCase() || '';
    const combined = `${description} ${requirements}`;

    // Order/Purchase Related
    if (combined.includes('order') || combined.includes('purchase') || combined.includes('buy')) {
      tools.push({
        type: 'function',
        function: {
          name: 'save_order',
          description: `Save customer orders for ${context.businessName}. Collect customer name, items with quantities, delivery/pickup preference, and contact information.`,
          parameters: {
            type: 'object',
            properties: {
              customerName: { type: 'string', description: 'Full name of the customer' },
              customerPhone: { type: 'string', description: 'Customer phone number' },
              items: {
                type: 'array',
                description: 'List of items being ordered',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Item name' },
                    quantity: { type: 'integer', description: 'Quantity ordered' },
                    specialInstructions: { type: 'string', description: 'Special instructions for this item' }
                  },
                  required: ['name', 'quantity']
                }
              },
              orderType: { type: 'string', enum: ['delivery', 'pickup'], description: 'Delivery or pickup' },
              address: { type: 'string', description: 'Delivery address if applicable' },
              notes: { type: 'string', description: 'Additional order notes' }
            },
            required: ['customerName', 'customerPhone', 'items', 'orderType']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    // Appointment/Booking Related
    if (combined.includes('appointment') || combined.includes('booking') || combined.includes('schedule') || combined.includes('reservation')) {
      tools.push({
        type: 'function',
        function: {
          name: 'book_appointment',
          description: `Schedule appointments for ${context.businessName}. Collect customer information, service type, preferred date/time, and any special requests.`,
          parameters: {
            type: 'object',
            properties: {
              customerName: { type: 'string', description: 'Full name of the customer' },
              customerPhone: { type: 'string', description: 'Customer phone number' },
              customerEmail: { type: 'string', description: 'Customer email address' },
              serviceType: { type: 'string', description: 'Type of service requested' },
              preferredDate: { type: 'string', description: 'Preferred appointment date' },
              preferredTime: { type: 'string', description: 'Preferred appointment time' },
              staffPreference: { type: 'string', description: 'Preferred staff member if any' },
              notes: { type: 'string', description: 'Additional notes or special requests' }
            },
            required: ['customerName', 'customerPhone', 'serviceType', 'preferredDate', 'preferredTime']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);

      tools.push({
        type: 'function',
        function: {
          name: 'check_availability',
          description: `Check availability for appointments at ${context.businessName}. Query available time slots for specific dates and services.`,
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'Date to check availability' },
              serviceType: { type: 'string', description: 'Type of service' },
              duration: { type: 'integer', description: 'Service duration in minutes' }
            },
            required: ['date']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    // Lead/Contact Collection
    if (combined.includes('lead') || combined.includes('contact') || combined.includes('inquiry') || combined.includes('information')) {
      tools.push({
        type: 'function',
        function: {
          name: 'save_lead',
          description: `Capture lead information for ${context.businessName}. Collect contact details and inquiry information for follow-up.`,
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Full name' },
              phone: { type: 'string', description: 'Phone number' },
              email: { type: 'string', description: 'Email address' },
              interest: { type: 'string', description: 'What they are interested in' },
              bestTimeToCall: { type: 'string', description: 'Best time to reach them' },
              notes: { type: 'string', description: 'Additional notes from the conversation' }
            },
            required: ['name', 'phone', 'interest']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    // Inventory/Availability Check
    if (combined.includes('inventory') || combined.includes('stock') || combined.includes('available') || combined.includes('check')) {
      tools.push({
        type: 'function',
        function: {
          name: 'check_inventory',
          description: `Check product or service availability at ${context.businessName}.`,
          parameters: {
            type: 'object',
            properties: {
              itemName: { type: 'string', description: 'Name of the item or service' },
              quantity: { type: 'integer', description: 'Quantity needed' }
            },
            required: ['itemName']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    // Feedback/Complaint
    if (combined.includes('feedback') || combined.includes('complaint') || combined.includes('review')) {
      tools.push({
        type: 'function',
        function: {
          name: 'save_feedback',
          description: `Record customer feedback or complaints for ${context.businessName}.`,
          parameters: {
            type: 'object',
            properties: {
              customerName: { type: 'string', description: 'Customer name' },
              customerPhone: { type: 'string', description: 'Customer phone number' },
              feedbackType: { type: 'string', enum: ['complaint', 'suggestion', 'compliment'], description: 'Type of feedback' },
              message: { type: 'string', description: 'Feedback message' },
              followUpRequired: { type: 'boolean', description: 'Whether follow-up is needed' }
            },
            required: ['customerName', 'feedbackType', 'message']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    // Default tool if no specific tools were generated
    if (tools.length === 0) {
      tools.push({
        type: 'function',
        function: {
          name: 'save_general_inquiry',
          description: `Save general inquiries and customer information for ${context.businessName}.`,
          parameters: {
            type: 'object',
            properties: {
              customerName: { type: 'string', description: 'Customer name' },
              customerPhone: { type: 'string', description: 'Phone number' },
              inquiryType: { type: 'string', description: 'Type of inquiry' },
              message: { type: 'string', description: 'Customer message or request' },
              timestamp: { type: 'string', description: 'Time of call' }
            },
            required: ['customerName', 'customerPhone', 'message']
          }
        },
        server: {
          url: `${baseUrl}/api/webhooks/tool-handler`,
          secret: process.env.WEBHOOK_SECRET || ''
        }
      } as CreateToolRequest);
    }

    return tools;
  }

  static generateSystemPrompt(context: ToolGenerationContext): string {
    const { businessName, businessType, businessDescription, customRequirements } = context;
    
    let prompt = `You are a professional and friendly AI assistant for ${businessName}`;
    
    // Add business type specific context
    if (businessType && businessType !== 'custom') {
      prompt += `, a ${businessType} business`;
    }
    
    prompt += `. ${businessDescription}\n\n`;
    
    prompt += `CRITICAL INSTRUCTIONS:\n`;
    prompt += `1. You MUST use the available tool functions for ANY business-specific information.\n`;
    prompt += `2. NEVER make up or guess information about our menu, prices, hours, services, or inventory.\n`;
    prompt += `3. When asked about menu items, prices, availability, or services, ALWAYS use the appropriate tool function.\n`;
    prompt += `4. If a customer asks about something and you have a relevant tool, USE IT immediately.\n`;
    prompt += `5. Do not provide generic information - always use tools to get accurate, current data.\n\n`;
    
    prompt += `Your main responsibilities are:\n`;
    
    // Add specific responsibilities based on requirements
    if (customRequirements) {
      const requirements = customRequirements.split(',').map(r => r.trim());
      requirements.forEach((req, index) => {
        prompt += `${index + 1}. ${req}\n`;
      });
    } else {
      prompt += `1. Answer customer inquiries using available tools for accurate information\n`;
      prompt += `2. Collect necessary information for orders, appointments, or follow-up\n`;
      prompt += `3. Use tools to save customer information and requests\n`;
    }
    
    prompt += `\nKey phrases that REQUIRE tool usage:\n`;
    prompt += `- "menu", "what do you have", "what's available" -> Use get_menu or similar tool\n`;
    prompt += `- "price", "cost", "how much" -> Use pricing or menu tool\n`;
    prompt += `- "hours", "when are you open" -> Use business hours tool\n`;
    prompt += `- "book", "appointment", "schedule" -> Use booking tool\n`;
    prompt += `- "order", "I want", "can I get" -> Use order tool\n`;
    
    prompt += `\nAlways be polite, professional, and helpful. Confirm important details before using tools to save information.`;
    
    return prompt;
  }

  static generateGreeting(context: ToolGenerationContext): string {
    const { businessName } = context;
    const combined = `${context.businessDescription} ${context.customRequirements || ''}`.toLowerCase();
    
    if (combined.includes('restaurant') || combined.includes('order')) {
      return `Thank you for calling ${businessName}! Would you like to place an order or make a reservation?`;
    }
    
    if (combined.includes('salon') || combined.includes('appointment')) {
      return `Thank you for calling ${businessName}! How can I help you book your perfect appointment today?`;
    }
    
    if (combined.includes('medical') || combined.includes('doctor')) {
      return `Thank you for calling ${businessName}. How may I assist you today?`;
    }
    
    return `Thank you for calling ${businessName}! How can I help you today?`;
  }

  static generateFirstMessage(context: ToolGenerationContext): string {
    return this.generateGreeting(context);
  }
}