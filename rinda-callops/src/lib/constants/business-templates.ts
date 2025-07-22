import { BusinessTemplate } from '@/types/models';

export const businessTemplates: BusinessTemplate[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    business_type: 'restaurant',
    description: 'Take orders, handle reservations, and answer menu questions',
    icon: '🍽️',
    system_prompt_template: `You are a friendly and professional AI assistant for {businessName}, a restaurant. Your primary responsibilities are:
1. Take customer orders accurately
2. Handle table reservations 
3. Answer questions about menu items, prices, and ingredients
4. Provide information about business hours and location
5. Process special requests and dietary restrictions

Always be polite, confirm orders before finalizing, and use the available tools to save information.`,
    greeting_template: 'Thank you for calling {businessName}! How can I help you today? Would you like to place an order or make a reservation?',
    suggested_tools: [
      {
        name: 'save_order',
        type: 'function',
        description: 'Save customer orders to database',
        required: true,
      },
      {
        name: 'check_availability',
        type: 'database_query',
        description: 'Check table availability for reservations',
        required: true,
      },
      {
        name: 'send_confirmation',
        type: 'api_call',
        description: 'Send order or reservation confirmation via SMS',
        required: false,
      },
    ],
    suggested_workflows: [
      {
        name: 'Order Confirmation',
        description: 'Send SMS confirmation after order is placed',
        trigger: { type: 'tool_executed', config: { toolName: 'save_order' } },
      },
      {
        name: 'Reservation Reminder',
        description: 'Call customer 1 hour before reservation',
        trigger: { type: 'scheduled' },
      },
    ],
    example_questions: [
      'I would like to order two large pizzas for delivery',
      'Do you have any vegetarian options?',
      'Can I make a reservation for 4 people tonight at 7pm?',
      'What are your business hours?',
    ],
  },
  {
    id: 'salon',
    name: 'Salon & Spa',
    business_type: 'salon',
    description: 'Book appointments, answer service questions, and manage schedules',
    icon: '💇',
    system_prompt_template: `You are a professional and friendly AI assistant for {businessName}, a salon/spa. Your main tasks are:
1. Schedule appointments for various services
2. Answer questions about services, prices, and availability
3. Handle appointment changes and cancellations
4. Collect customer contact information
5. Provide information about stylists/therapists

Be warm and professional, always confirm appointment details, and use tools to manage bookings.`,
    greeting_template: 'Thank you for calling {businessName}! How can I help you book your perfect appointment today?',
    suggested_tools: [
      {
        name: 'book_appointment',
        type: 'function',
        description: 'Schedule customer appointments',
        required: true,
      },
      {
        name: 'check_schedule',
        type: 'database_query',
        description: 'Check stylist availability',
        required: true,
      },
      {
        name: 'send_reminder',
        type: 'api_call',
        description: 'Send appointment reminders',
        required: false,
      },
    ],
    suggested_workflows: [
      {
        name: 'Appointment Confirmation',
        description: 'Send SMS confirmation after booking',
        trigger: { type: 'tool_executed', config: { toolName: 'book_appointment' } },
      },
      {
        name: 'Day Before Reminder',
        description: 'Call customer day before appointment',
        trigger: { type: 'scheduled' },
      },
    ],
    example_questions: [
      'I need to book a haircut for tomorrow afternoon',
      'What services do you offer?',
      'How much is a manicure and pedicure?',
      'Is Sarah available this Saturday?',
    ],
  },
  {
    id: 'medical',
    name: 'Medical Office',
    business_type: 'medical',
    description: 'Schedule appointments, handle prescription refills, and answer patient questions',
    icon: '🏥',
    system_prompt_template: `You are a professional AI assistant for {businessName}, a medical office. Your responsibilities include:
1. Schedule patient appointments
2. Handle prescription refill requests
3. Answer general questions about office hours and procedures
4. Collect patient information for callbacks
5. Provide directions to the office

Always maintain patient privacy, be empathetic, and use tools to properly document all requests.`,
    greeting_template: 'Thank you for calling {businessName}. How may I assist you today?',
    suggested_tools: [
      {
        name: 'schedule_appointment',
        type: 'function',
        description: 'Schedule patient appointments',
        required: true,
      },
      {
        name: 'save_refill_request',
        type: 'function',
        description: 'Record prescription refill requests',
        required: true,
      },
      {
        name: 'send_confirmation',
        type: 'api_call',
        description: 'Send appointment confirmations',
        required: false,
      },
    ],
    suggested_workflows: [
      {
        name: 'Appointment Reminder',
        description: 'Send reminder 24 hours before appointment',
        trigger: { type: 'scheduled' },
      },
      {
        name: 'Refill Processing',
        description: 'Notify pharmacy of refill request',
        trigger: { type: 'tool_executed', config: { toolName: 'save_refill_request' } },
      },
    ],
    example_questions: [
      'I need to schedule a follow-up appointment',
      'Can I request a prescription refill?',
      'What insurance do you accept?',
      'What are your office hours?',
    ],
  },
  {
    id: 'retail',
    name: 'Retail Store',
    business_type: 'retail',
    description: 'Check inventory, take orders, and answer product questions',
    icon: '🛍️',
    system_prompt_template: `You are a helpful AI assistant for {businessName}, a retail store. Your main functions are:
1. Check product availability and inventory
2. Take customer orders for pickup or delivery
3. Answer questions about products, prices, and features
4. Process returns and exchanges information
5. Provide store hours and location details

Be friendly and helpful, always confirm order details, and use tools to check inventory and save orders.`,
    greeting_template: 'Welcome to {businessName}! How can I help you shop with us today?',
    suggested_tools: [
      {
        name: 'check_inventory',
        type: 'database_query',
        description: 'Check product availability',
        required: true,
      },
      {
        name: 'create_order',
        type: 'function',
        description: 'Save customer orders',
        required: true,
      },
      {
        name: 'send_receipt',
        type: 'api_call',
        description: 'Email order confirmation',
        required: false,
      },
    ],
    suggested_workflows: [
      {
        name: 'Order Ready Notification',
        description: 'Call customer when order is ready for pickup',
        trigger: { type: 'manual' },
      },
      {
        name: 'Low Stock Alert',
        description: 'Notify manager when inventory is low',
        trigger: { type: 'tool_executed', config: { toolName: 'check_inventory' } },
      },
    ],
    example_questions: [
      'Do you have the iPhone 15 in stock?',
      'Can I order a laptop for pickup tomorrow?',
      'What is your return policy?',
      'Are you open on Sundays?',
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    business_type: 'real-estate',
    description: 'Schedule property viewings, answer listing questions, and capture leads',
    icon: '🏠',
    system_prompt_template: `You are a professional AI assistant for {businessName}, a real estate agency. Your duties include:
1. Schedule property viewings and open houses
2. Answer questions about available properties
3. Capture lead information for follow-up
4. Provide information about neighborhoods and pricing
5. Connect callers with appropriate agents

Be professional and informative, gather contact details, and use tools to schedule viewings and save leads.`,
    greeting_template: 'Thank you for calling {businessName}! Are you looking to buy, sell, or rent a property today?',
    suggested_tools: [
      {
        name: 'schedule_viewing',
        type: 'function',
        description: 'Schedule property viewings',
        required: true,
      },
      {
        name: 'save_lead',
        type: 'function',
        description: 'Capture lead information',
        required: true,
      },
      {
        name: 'send_listings',
        type: 'api_call',
        description: 'Email property listings',
        required: false,
      },
    ],
    suggested_workflows: [
      {
        name: 'Lead Follow-up',
        description: 'Assign new leads to agents',
        trigger: { type: 'tool_executed', config: { toolName: 'save_lead' } },
      },
      {
        name: 'Viewing Reminder',
        description: 'Send reminder before property viewing',
        trigger: { type: 'scheduled' },
      },
    ],
    example_questions: [
      'What homes do you have available in the $300k range?',
      'Can I schedule a viewing for the house on Main Street?',
      'What neighborhoods do you recommend for families?',
      'Do you handle rentals?',
    ],
  },
];