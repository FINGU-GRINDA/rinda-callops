import { motion } from 'framer-motion';
import { 
  Utensils, 
  Building, 
  Stethoscope, 
  ShoppingBag, 
  Scissors,
  Home,
  Briefcase,
  GraduationCap,
  Car,
  Dumbbell,
  Coffee,
  Hotel,
  PhoneCall,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  preConfigured: {
    greeting: string;
    personality: string;
    tools: string[];
  };
}

const templates: Template[] = [
  {
    id: 'sales-discovery',
    name: 'Sales Discovery Call',
    description: 'Automated post-call workflow for sales teams',
    icon: <PhoneCall className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-600',
    features: ['CRM updates', 'Proposal generation', 'Calendar booking', 'Team notifications', 'Competitor analysis'],
    preConfigured: {
      greeting: "Thank you for your time today! I'm here to help document our conversation and prepare the next steps.",
      personality: "Professional, detail-oriented sales assistant that captures key information and automates follow-up tasks",
      tools: ['crm-update', 'proposal-generator', 'calendar-integration', 'slack-notification', 'competitor-analysis']
    }
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Perfect for restaurants and cafes',
    icon: <Utensils className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
    features: ['Reservations', 'Menu inquiries', 'Hours & location', 'Special events'],
    preConfigured: {
      greeting: "Thank you for calling {businessName}! I can help you with reservations, menu questions, or provide information about our hours and location.",
      personality: "Friendly, welcoming, and knowledgeable about food and dining",
      tools: ['menu', 'order', 'appointment', 'faq', 'location']
    }
  },
  {
    id: 'medical',
    name: 'Medical Practice',
    description: 'For clinics and healthcare providers',
    icon: <Stethoscope className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-600',
    features: ['Appointments', 'Office hours', 'Insurance info', 'Emergency routing'],
    preConfigured: {
      greeting: "Thank you for calling {businessName}. I can help schedule appointments, provide office hours, or connect you with the appropriate department.",
      personality: "Professional, caring, and HIPAA-compliant in all interactions",
      tools: ['appointment', 'emergency', 'location', 'staff']
    }
  },
  {
    id: 'retail',
    name: 'Retail Store',
    description: 'For shops and e-commerce',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-600',
    features: ['Product availability', 'Store hours', 'Orders', 'Returns'],
    preConfigured: {
      greeting: "Welcome to {businessName}! I can help you check product availability, store hours, or assist with orders and returns.",
      personality: "Helpful, product-knowledgeable, and solution-oriented",
      tools: ['database', 'order', 'location', 'faq']
    }
  },
  {
    id: 'salon',
    name: 'Salon & Spa',
    description: 'Beauty and wellness services',
    icon: <Scissors className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-600',
    features: ['Appointments', 'Services & pricing', 'Stylist availability', 'Special offers'],
    preConfigured: {
      greeting: "Welcome to {businessName}! I'd be happy to help you book an appointment or tell you about our services and current specials.",
      personality: "Warm, attentive, and knowledgeable about beauty services",
      tools: ['appointment', 'staff', 'database', 'payment']
    }
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    description: 'Property management and sales',
    icon: <Home className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
    features: ['Property inquiries', 'Viewing schedules', 'Agent contact', 'Market info'],
    preConfigured: {
      greeting: "Thank you for calling {businessName}. I can help you with property information, schedule viewings, or connect you with one of our agents.",
      personality: "Professional, informative, and attentive to client needs",
      tools: ['appointment', 'database', 'staff', 'email']
    }
  },
  {
    id: 'fitness',
    name: 'Fitness Center',
    description: 'Gyms and fitness studios',
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'from-indigo-500 to-blue-600',
    features: ['Class schedules', 'Membership info', 'Personal training', 'Facility hours'],
    preConfigured: {
      greeting: "Welcome to {businessName}! I can help you with class schedules, membership information, or book a personal training session.",
      personality: "Energetic, motivating, and health-focused",
      tools: ['appointment', 'database', 'location', 'payment']
    }
  }
];

interface QuickStartTemplatesProps {
  onSelectTemplate: (template: Template | null) => void;
}

export default function QuickStartTemplates({ onSelectTemplate }: QuickStartTemplatesProps) {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quick Start Templates</h2>
        <p className="text-gray-400">Choose a pre-configured template to get started quickly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              onClick={() => onSelectTemplate(template)}
              className="bg-slate-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{template.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-medium">Includes:</p>
                <ul className="space-y-1">
                  {template.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Use This Template
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white"
          onClick={() => onSelectTemplate(null)}
        >
          Start from Scratch Instead
        </Button>
      </div>
    </div>
  );
}