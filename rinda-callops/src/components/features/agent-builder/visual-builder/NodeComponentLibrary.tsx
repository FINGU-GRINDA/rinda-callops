import { useState, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MessageSquare, 
  Database, 
  Globe, 
  FileText,
  Mail,
  CreditCard,
  MapPin,
  Clock,
  Users,
  ShoppingCart,
  Heart,
  Star,
  Phone,
  Shield,
  Briefcase,
  Home,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DraggableComponentItem from './DraggableComponentItem';
import CustomToolBuilder from './CustomToolBuilder';
import { Tool } from '../types';
import { Wand2 } from 'lucide-react';
import { businessTemplates } from '@/lib/constants/business-templates';

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const components: ComponentItem[] = [
  // Integration Tools
  {
    id: 'crm-update',
    name: 'CRM Update',
    description: 'Update Salesforce, HubSpot, or Pipedrive',
    icon: <Database className="w-5 h-5" />,
    category: 'Integrations'
  },
  {
    id: 'calendar-integration',
    name: 'Calendar Sync',
    description: 'Book meetings in Google or Outlook',
    icon: <Calendar className="w-5 h-5" />,
    category: 'Integrations'
  },
  {
    id: 'slack-notification',
    name: 'Slack Notification',
    description: 'Send updates to Slack channels',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'Integrations'
  },
  {
    id: 'proposal-generator',
    name: 'Proposal Generator',
    description: 'Create personalized proposals',
    icon: <FileText className="w-5 h-5" />,
    category: 'Integrations'
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Generate comparison documents',
    icon: <Shield className="w-5 h-5" />,
    category: 'Integrations'
  },
  // Regular Tools
  {
    id: 'appointment',
    name: 'Appointment Booking',
    description: 'Schedule and manage appointments',
    icon: <Calendar className="w-5 h-5" />,
    category: 'Scheduling'
  },
  {
    id: 'faq',
    name: 'FAQ Handler',
    description: 'Answer common questions',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'Communication'
  },
  {
    id: 'database',
    name: 'Database Query',
    description: 'Search and retrieve information',
    icon: <Database className="w-5 h-5" />,
    category: 'Data'
  },
  {
    id: 'location',
    name: 'Location & Hours',
    description: 'Provide location and business hours',
    icon: <MapPin className="w-5 h-5" />,
    category: 'Information'
  },
  {
    id: 'order',
    name: 'Order Management',
    description: 'Take and track orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'Sales'
  },
  {
    id: 'menu',
    name: 'Menu List',
    description: 'Display menu items with prices and descriptions',
    icon: <FileText className="w-5 h-5" />,
    category: 'Information'
  },
  {
    id: 'payment',
    name: 'Payment Processing',
    description: 'Handle payment information',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'Sales'
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Send confirmation emails',
    icon: <Mail className="w-5 h-5" />,
    category: 'Communication'
  },
  {
    id: 'reviews',
    name: 'Review Collection',
    description: 'Gather customer feedback',
    icon: <Star className="w-5 h-5" />,
    category: 'Feedback'
  },
  {
    id: 'emergency',
    name: 'Emergency Protocol',
    description: 'Handle urgent situations',
    icon: <Shield className="w-5 h-5" />,
    category: 'Safety'
  },
  {
    id: 'staff',
    name: 'Staff Directory',
    description: 'Connect to specific staff members',
    icon: <Users className="w-5 h-5" />,
    category: 'Information'
  }
];

interface NodeComponentLibraryProps {
  onClose: () => void;
  onAddNode?: (toolType: string, toolName: string, toolData?: any) => void;
  onOpenCustomToolBuilder?: () => void;
  businessType?: string;
}

export default function NodeComponentLibrary({ onClose, onAddNode, onOpenCustomToolBuilder, businessType }: NodeComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllComponents, setShowAllComponents] = useState(false);

  // Get template-recommended tools
  const currentTemplate = businessTemplates.find(t => t.id === businessType);
  // Get recommended tool IDs from the template's suggested tools
  const recommendedToolIds = currentTemplate?.suggested_tools?.map(tool => {
    // Map common tool names to component IDs
    const toolNameMap: Record<string, string> = {
      'save_order': 'order',
      'check_availability': 'appointment',
      'send_confirmation': 'email',
      'schedule_appointment': 'appointment',
      'save_appointment': 'appointment',
      'send_appointment_reminder': 'email',
      'track_product': 'database',
      'save_stylist_preference': 'staff',
      'save_property_inquiry': 'database',
      'book_class': 'appointment'
    };
    return toolNameMap[tool.name] || tool.name;
  }).filter(Boolean) || [];
  
  // For sales development template, hardcode the tools since it uses a different structure
  const salesDevTools = ['crm-update', 'proposal-generator', 'calendar-integration', 'slack-notification', 'competitor-analysis'];
  const templateToolMap: Record<string, string[]> = {
    'sales': salesDevTools,
    'restaurant': ['menu', 'order', 'appointment', 'faq', 'location'],
    'medical': ['appointment', 'emergency', 'location', 'staff'],
    'retail': ['database', 'order', 'location', 'faq'],
    'salon': ['appointment', 'staff', 'database', 'payment'],
    'realestate': ['appointment', 'database', 'staff', 'email'],
    'fitness': ['appointment', 'database', 'location', 'payment']
  };
  
  // Use the hardcoded map as fallback
  const finalRecommendedToolIds = recommendedToolIds.length > 0 
    ? recommendedToolIds 
    : (templateToolMap[businessType || ''] || []);
  
  // Separate components into recommended and others
  const recommendedComponents = components.filter(c => finalRecommendedToolIds.includes(c.id));
  const otherComponents = components.filter(c => !finalRecommendedToolIds.includes(c.id));
  
  const categories = Array.from(new Set(components.map(c => c.category)));

  // Apply filters
  const filterComponents = (componentList: ComponentItem[]) => {
    return componentList.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || component.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };
  
  const filteredRecommended = filterComponents(recommendedComponents);
  const filteredOthers = filterComponents(otherComponents);
  const filteredComponents = showAllComponents 
    ? [...filteredRecommended, ...filteredOthers]
    : filteredRecommended;

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      className="w-96 h-full bg-slate-800/95 backdrop-blur-xl border-r border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Component Library</h2>
            {currentTemplate && !showAllComponents && (
              <p className="text-sm text-gray-400 mt-1">
                Showing tools for {currentTemplate.name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Search */}
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-700/50 border-gray-600 text-white placeholder:text-gray-400 mb-3"
        />
        
        {/* Toggle for showing all components */}
        {currentTemplate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllComponents(!showAllComponents)}
            className="w-full bg-slate-700/50 border-gray-600 text-white hover:bg-slate-700"
          >
            {showAllComponents ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Show Recommended Only
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show All Components ({otherComponents.length} more)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 
              "bg-blue-500 hover:bg-blue-600 text-white" : 
              "text-gray-300 hover:bg-white/10"
            }
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 
                "bg-blue-500 hover:bg-blue-600 text-white" : 
                "text-gray-300 hover:bg-white/10"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {showAllComponents && filteredRecommended.length > 0 && filteredOthers.length > 0 && (
            <>
              {/* Recommended Components */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  Recommended for {currentTemplate?.name}
                </h3>
                <div className="space-y-3">
                  {filteredRecommended.map((component) => (
                    <DraggableComponentItem
                      key={component.id}
                      id={component.id}
                      name={component.name}
                      description={component.description}
                      icon={component.icon}
                      category={component.category}
                      onDragStart={(event, nodeType, label) => {
                        const platformMap: Record<string, string> = {
                          'crm-update': 'Salesforce',
                          'calendar-integration': 'Google Calendar',
                          'slack-notification': 'Slack',
                          'proposal-generator': 'AI Generator',
                          'competitor-analysis': 'Market Analysis'
                        };
                        
                        const nodeData = JSON.stringify({ 
                          type: nodeType, 
                          label, 
                          toolType: component.id,
                          integrationType: component.id,
                          platform: platformMap[component.id] || component.category,
                          connectionStatus: 'disconnected'
                        });
                        event.dataTransfer.setData('application/reactflow', nodeData);
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  Other Available Components
                </h3>
                <div className="space-y-3">
                  {filteredOthers.map((component) => (
                    <DraggableComponentItem
                      key={component.id}
                      id={component.id}
                      name={component.name}
                      description={component.description}
                      icon={component.icon}
                      category={component.category}
                      onDragStart={(event, nodeType, label) => {
                        const platformMap: Record<string, string> = {
                          'crm-update': 'Salesforce',
                          'calendar-integration': 'Google Calendar',
                          'slack-notification': 'Slack',
                          'proposal-generator': 'AI Generator',
                          'competitor-analysis': 'Market Analysis'
                        };
                        
                        const nodeData = JSON.stringify({ 
                          type: nodeType, 
                          label, 
                          toolType: component.id,
                          integrationType: component.id,
                          platform: platformMap[component.id] || component.category,
                          connectionStatus: 'disconnected'
                        });
                        event.dataTransfer.setData('application/reactflow', nodeData);
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Regular list when not showing all or no separation needed */}
          {(!showAllComponents || filteredRecommended.length === 0 || filteredOthers.length === 0) && 
            filteredComponents.map((component) => (
              <DraggableComponentItem
                key={component.id}
                id={component.id}
                name={component.name}
                description={component.description}
                icon={component.icon}
                category={component.category}
                onDragStart={(event, nodeType, label) => {
                  const platformMap: Record<string, string> = {
                    'crm-update': 'Salesforce',
                    'calendar-integration': 'Google Calendar',
                    'slack-notification': 'Slack',
                    'proposal-generator': 'AI Generator',
                    'competitor-analysis': 'Market Analysis'
                  };
                  
                  const nodeData = JSON.stringify({ 
                    type: nodeType, 
                    label, 
                    toolType: component.id,
                    integrationType: component.id,
                    platform: platformMap[component.id] || component.category,
                    connectionStatus: 'disconnected'
                  });
                  event.dataTransfer.setData('application/reactflow', nodeData);
                }}
              />
            ))
          }
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700 bg-slate-900/50 space-y-4">
        <Button
          onClick={() => onOpenCustomToolBuilder && onOpenCustomToolBuilder()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Create Custom Tool
        </Button>
        <p className="text-gray-400 text-sm text-center">
          Drag components to the canvas or click to add
        </p>
      </div>
    </motion.div>
  );
}

// Create a separate component for the modal that can be rendered at app level
export function CustomToolBuilderModal({ 
  isOpen, 
  onClose, 
  onAddTool, 
  businessType 
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTool: (toolType: string, toolName: string, toolData?: any) => void;
  businessType: string;
}) {
  return (
    <CustomToolBuilder
      isOpen={isOpen}
      onClose={onClose}
      onAddTool={(tool) => {
        onAddTool('toolNode', tool.display_name || tool.name, tool);
        onClose();
      }}
      businessType={businessType}
    />
  );
}