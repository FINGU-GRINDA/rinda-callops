/**
 * Tools API client - wrapper functions for the /api/tools endpoints
 */

export interface BusinessData {
  name: string;
  type: string;
  description: string;
  requirements?: string;
}

export interface ToolConfiguration {
  menu?: string;
  menuItems?: Array<{ name: string; price: number; description?: string }>;
  services?: string;
  serviceTypes?: string[];
  doctors?: string[];
  stylists?: string[];
  hours?: Record<string, string>;
  inventory?: string;
  products?: string;
  [key: string]: any;
}

export interface GenerateToolsRequest {
  businessData: BusinessData;
  toolConfiguration?: ToolConfiguration;
}

export interface GeneratedTool {
  name: string;
  displayName: string;
  description: string;
  type: string;
  enabled: boolean;
  configuration?: any;
  json_schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
    additionalProperties: boolean;
  };
}

export interface GenerateToolsResponse {
  tools: GeneratedTool[];
}

/**
 * Generate AI tools using the ToolGeneratorService
 * @param request - Business data and tool configuration
 * @param authToken - JWT auth token
 * @returns Promise with generated tools
 */
export async function generateAITools(
  request: GenerateToolsRequest,
  authToken: string
): Promise<GenerateToolsResponse> {
  const response = await fetch('/api/tools/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Example usage for a restaurant business
 */
export async function generateRestaurantTools(authToken: string) {
  const request: GenerateToolsRequest = {
    businessData: {
      name: "Mario's Italian Bistro",
      type: "restaurant",
      description: "Family-owned Italian restaurant serving authentic pasta, pizza, and traditional dishes",
      requirements: "Take orders, provide menu information, handle reservations"
    },
    toolConfiguration: {
      menu: "Margherita Pizza - $12.99\nPepperoni Pizza - $14.99\nLasagna - $16.99\nCaesar Salad - $8.99",
      menuItems: [
        { name: "Margherita Pizza", price: 12.99, description: "Fresh mozzarella, tomatoes, and basil" },
        { name: "Pepperoni Pizza", price: 14.99, description: "Classic pepperoni with mozzarella" },
        { name: "Lasagna", price: 16.99, description: "Traditional meat lasagna with ricotta" },
        { name: "Caesar Salad", price: 8.99, description: "Crisp romaine with parmesan and croutons" }
      ],
      hours: {
        monday: "11:00 AM - 10:00 PM",
        tuesday: "11:00 AM - 10:00 PM",
        wednesday: "11:00 AM - 10:00 PM",
        thursday: "11:00 AM - 10:00 PM",
        friday: "11:00 AM - 11:00 PM",
        saturday: "11:00 AM - 11:00 PM",
        sunday: "12:00 PM - 9:00 PM"
      }
    }
  };

  return generateAITools(request, authToken);
}

/**
 * Example usage for a medical clinic
 */
export async function generateMedicalTools(authToken: string) {
  const request: GenerateToolsRequest = {
    businessData: {
      name: "Downtown Family Clinic",
      type: "medical",
      description: "Primary care clinic providing comprehensive healthcare services for families",
      requirements: "Schedule appointments, check insurance, provide clinic information"
    },
    toolConfiguration: {
      doctors: ["Dr. Smith", "Dr. Johnson", "Dr. Williams"],
      services: "Primary care, vaccinations, annual checkups, minor procedures",
      hours: {
        monday: "8:00 AM - 6:00 PM",
        tuesday: "8:00 AM - 6:00 PM",
        wednesday: "8:00 AM - 6:00 PM",
        thursday: "8:00 AM - 6:00 PM",
        friday: "8:00 AM - 5:00 PM",
        saturday: "9:00 AM - 2:00 PM",
        sunday: "Closed"
      }
    }
  };

  return generateAITools(request, authToken);
}

/**
 * Example usage for a salon/spa
 */
export async function generateSalonTools(authToken: string) {
  const request: GenerateToolsRequest = {
    businessData: {
      name: "Bella Beauty Salon",
      type: "salon",
      description: "Full-service beauty salon offering haircuts, coloring, and spa treatments",
      requirements: "Book appointments, check availability, provide service information"
    },
    toolConfiguration: {
      services: "Haircuts, Hair coloring, Highlights, Manicures, Pedicures, Facials, Massages",
      serviceTypes: ["haircut", "color", "highlights", "manicure", "pedicure", "facial", "massage"],
      stylists: ["Sarah", "Maria", "Jessica", "Amanda"],
      hours: {
        monday: "Closed",
        tuesday: "9:00 AM - 7:00 PM",
        wednesday: "9:00 AM - 7:00 PM",
        thursday: "9:00 AM - 7:00 PM",
        friday: "9:00 AM - 7:00 PM",
        saturday: "8:00 AM - 6:00 PM",
        sunday: "10:00 AM - 5:00 PM"
      }
    }
  };

  return generateAITools(request, authToken);
}