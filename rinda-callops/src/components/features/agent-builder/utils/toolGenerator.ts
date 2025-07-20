import { BusinessData, Tool } from '../types';

export function generateToolsFromBusinessData(businessType: string, businessData: BusinessData): Tool[] {
  const tools: Tool[] = [];

  // RESTAURANT TOOLS
  if (businessType === 'restaurant') {
    // Menu tool - if menu is provided
    if (businessData.menu) {
      tools.push({
        name: 'get_menu_info',
        description: 'Get information about menu items, prices, and availability',
        enabled: true,
        parameters: {
          type: 'object',
          properties: {
            item: {
              type: 'string',
              description: 'The menu item or category to get information about'
            },
            dietary_restrictions: {
              type: 'string',
              description: 'Any dietary restrictions to consider (vegan, gluten-free, etc.)'
            }
          },
          required: ['item']
        }
      });
    }

    // Order taking tool
    tools.push({
      name: 'save_order',
      description: 'Save customer order information',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Customer name' },
          customer_phone: { type: 'string', description: 'Customer phone number' },
          order_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                quantity: { type: 'number' },
                special_instructions: { type: 'string' }
              }
            },
            description: 'List of ordered items'
          },
          order_type: {
            type: 'string',
            enum: ['dine-in', 'takeout', 'delivery'],
            description: 'Type of order'
          },
          total_amount: { type: 'number', description: 'Total order amount' }
        },
        required: ['customer_name', 'customer_phone', 'order_items', 'order_type']
      }
    });

    // Reservation tool
    tools.push({
      name: 'make_reservation',
      description: 'Make a table reservation',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Customer name' },
          customer_phone: { type: 'string', description: 'Customer phone number' },
          party_size: { type: 'number', description: 'Number of people' },
          date: { type: 'string', description: 'Reservation date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Reservation time (HH:MM)' },
          special_requests: { type: 'string', description: 'Any special requests or notes' }
        },
        required: ['customer_name', 'customer_phone', 'party_size', 'date', 'time']
      }
    });
  }

  // SALON TOOLS
  if (businessType === 'salon') {
    // Services tool
    if (businessData.services) {
      tools.push({
        name: 'get_services_info',
        description: 'Get information about services, prices, and availability',
        enabled: true,
        parameters: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Service to inquire about' },
            duration: { type: 'boolean', description: 'Whether to include duration info' }
          },
          required: ['service']
        }
      });
    }

    // Booking tool
    tools.push({
      name: 'book_appointment',
      description: 'Book salon/spa appointments',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Customer name' },
          customer_phone: { type: 'string', description: 'Customer phone number' },
          service: { type: 'string', description: 'Requested service' },
          stylist: { type: 'string', description: 'Preferred stylist (optional)' },
          date: { type: 'string', description: 'Appointment date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Appointment time (HH:MM)' }
        },
        required: ['customer_name', 'customer_phone', 'service', 'date', 'time']
      }
    });
  }

  // MEDICAL TOOLS
  if (businessType === 'medical') {
    // Appointment scheduling
    tools.push({
      name: 'schedule_appointment',
      description: 'Schedule medical appointments',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          patient_name: { type: 'string', description: 'Patient name' },
          patient_phone: { type: 'string', description: 'Patient phone number' },
          doctor: { type: 'string', description: 'Preferred doctor (optional)' },
          appointment_type: { type: 'string', description: 'Type of appointment' },
          date: { type: 'string', description: 'Appointment date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Appointment time (HH:MM)' }
        },
        required: ['patient_name', 'patient_phone', 'appointment_type', 'date', 'time']
      }
    });

    // Prescription refill
    tools.push({
      name: 'prescription_refill',
      description: 'Handle prescription refill requests',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          patient_name: { type: 'string', description: 'Patient name' },
          medication: { type: 'string', description: 'Medication name' },
          pharmacy: { type: 'string', description: 'Preferred pharmacy' }
        },
        required: ['patient_name', 'medication']
      }
    });
  }

  // RETAIL TOOLS
  if (businessType === 'retail') {
    // Inventory check
    if (businessData.inventory || businessData.products) {
      tools.push({
        name: 'check_product_availability',
        description: 'Check product availability and pricing',
        enabled: true,
        parameters: {
          type: 'object',
          properties: {
            product: { type: 'string', description: 'Product to check' },
            quantity: { type: 'number', description: 'Desired quantity' }
          },
          required: ['product']
        }
      });
    }

    // Order placement
    tools.push({
      name: 'place_order',
      description: 'Place customer orders for pickup or delivery',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Customer name' },
          customer_phone: { type: 'string', description: 'Customer phone number' },
          items: { type: 'array', description: 'Ordered items' },
          order_type: { type: 'string', enum: ['pickup', 'delivery'], description: 'Order type' }
        },
        required: ['customer_name', 'customer_phone', 'items', 'order_type']
      }
    });
  }

  // REAL ESTATE TOOLS
  if (businessType === 'real-estate') {
    // Property search
    if (businessData.listings) {
      tools.push({
        name: 'search_properties',
        description: 'Search available properties based on criteria',
        enabled: true,
        parameters: {
          type: 'object',
          properties: {
            price_range: { type: 'string', description: 'Budget range' },
            bedrooms: { type: 'number', description: 'Number of bedrooms' },
            location: { type: 'string', description: 'Preferred location/area' },
            property_type: { type: 'string', enum: ['house', 'apartment', 'condo'], description: 'Property type' }
          }
        }
      });
    }

    // Schedule viewing
    tools.push({
      name: 'schedule_viewing',
      description: 'Schedule property viewings',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Customer name' },
          customer_phone: { type: 'string', description: 'Customer phone number' },
          property_address: { type: 'string', description: 'Property address' },
          date: { type: 'string', description: 'Viewing date (YYYY-MM-DD)' },
          time: { type: 'string', description: 'Viewing time (HH:MM)' }
        },
        required: ['customer_name', 'customer_phone', 'property_address', 'date', 'time']
      }
    });

    // Lead capture
    tools.push({
      name: 'capture_lead',
      description: 'Capture potential buyer/seller information',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Lead name' },
          phone: { type: 'string', description: 'Phone number' },
          email: { type: 'string', description: 'Email address' },
          interest: { type: 'string', enum: ['buying', 'selling', 'renting'], description: 'Interest type' },
          budget: { type: 'string', description: 'Budget range' }
        },
        required: ['name', 'phone', 'interest']
      }
    });
  }

  // Common hours tool for all business types
  if (businessData.hours && Object.values(businessData.hours).some(h => h)) {
    tools.push({
      name: 'get_business_hours',
      description: 'Get business hours and availability information',
      enabled: true,
      parameters: {
        type: 'object',
        properties: {
          day: {
            type: 'string',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'today'],
            description: 'The day to check hours for'
          }
        },
        required: ['day']
      }
    });
  }

  return tools;
}