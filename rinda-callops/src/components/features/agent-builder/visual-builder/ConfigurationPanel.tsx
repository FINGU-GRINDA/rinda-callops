import { motion } from 'framer-motion';
import { X, Save, Sparkles, Trash2, Plus, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { businessTemplates } from '@/lib/constants/business-templates';
import { AgentData } from '../types';
import { Node } from 'reactflow';
import GoogleSheetsIntegration from '../GoogleSheetsIntegration';

interface ConfigurationPanelProps {
  node: Node;
  agentData: AgentData;
  onUpdate: (updates: Partial<AgentData>) => void;
  onClose: () => void;
  onDelete?: () => void;
  onUpdateNode?: (nodeUpdates: any) => void;
  onSave?: () => void;
}

const voiceOptions = [
  { id: 'ash', name: 'Ash', description: 'Deep, masculine voice' },
  { id: 'ballad', name: 'Ballad', description: 'British professional voice' },
  { id: 'coral', name: 'Coral', description: 'Warm, feminine voice' },
  { id: 'sage', name: 'Sage', description: 'Wise, professional voice' },
  { id: 'verse', name: 'Verse', description: 'Melodic, feminine voice' },
];

export default function ConfigurationPanel({ node, agentData, onUpdate, onClose, onDelete, onUpdateNode, onSave }: ConfigurationPanelProps) {
  const [menuItems, setMenuItems] = useState<Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    category: string;
    image?: string;
  }>>(node.data.menuItems || []);
  const [bulkMenuText, setBulkMenuText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  
  // Update first message when opening personality node if it still has placeholder
  useEffect(() => {
    if (node.type === 'personalityNode' && agentData.business_name && agentData.first_message?.includes('{businessName}')) {
      // Small delay to avoid race conditions
      const timer = setTimeout(() => {
        const updatedFirstMessage = agentData.first_message.replace(/{businessName}/g, agentData.business_name);
        onUpdate({ first_message: updatedFirstMessage });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [node.id]); // Only run when node changes (panel opens)

  // Set loading to false after menu items are loaded
  useEffect(() => {
    if (node.id === 'menu') {
      // Simulate loading time to show skeleton
      const timer = setTimeout(() => {
        setIsLoadingMenu(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [node.id]);

  const parseMenuText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedItems: typeof menuItems = [];
    let currentCategory = 'Main Courses';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if it's a category header (e.g., "APPETIZERS:", "Main Dishes:", etc.)
      if (trimmedLine.match(/^[A-Z\s]+:?$/i) || trimmedLine.endsWith(':')) {
        currentCategory = trimmedLine.replace(':', '').trim();
        return;
      }
      
      // Try to parse menu item with price
      // Formats: "Chicken Parmesan - $15.99" or "Chicken Parmesan $15.99" or "Chicken Parmesan..... $15.99"
      const priceMatch = trimmedLine.match(/^(.+?)\s*[-–—.]*\s*\$?(\d+\.?\d*)$/);
      if (priceMatch) {
        const [, itemName, price] = priceMatch;
        parsedItems.push({
          id: Date.now().toString() + Math.random(),
          name: itemName.trim(),
          description: '',
          price: `$${price}`,
          category: currentCategory,
        });
      } else if (trimmedLine) {
        // If no price found, add item without price
        parsedItems.push({
          id: Date.now().toString() + Math.random(),
          name: trimmedLine,
          description: '',
          price: '',
          category: currentCategory,
        });
      }
    });
    
    return parsedItems;
  };

  const processMenuImage = async (file: File) => {
    setProcessingImage(true);
    try {
      // Import VisionService
      const { VisionService } = await import('@/lib/services/vision.service');
      
      // Convert image to base64
      const base64Image = await VisionService.fileToBase64(file);

      // Create the prompt for menu extraction
      const prompt = `Extract all menu items from this image. Return them in this exact format:
CATEGORY NAME:
Item Name - $Price
Item Name - $Price

For example:
APPETIZERS:
Mozzarella Sticks - $8.99
Caesar Salad - $12.99

MAIN COURSES:
Grilled Salmon - $24.99
Chicken Parmesan - $18.99

Extract all categories and items with their prices. If no price is visible for an item, just list the item name.`;

      // Analyze the image
      const response = await VisionService.analyzeImage({
        image: base64Image,
        prompt
      });
      
      // Parse the extracted text
      const items = parseMenuText(response.text);
      setMenuItems([...menuItems, ...items]);
      
      alert(`Successfully extracted ${items.length} menu items!`);
    } catch (error) {
      console.error('Error processing menu image:', error);
      alert('Failed to process menu image. Please try pasting the menu text instead.');
    } finally {
      setProcessingImage(false);
    }
  };

  const renderConfiguration = () => {
    switch (node.type) {
      case 'businessNode':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Agent Name</Label>
              <Input
                value={agentData.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="e.g., Customer Service AI"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white mb-2">Business Name</Label>
              <Input
                value={agentData.business_name}
                onChange={(e) => onUpdate({ business_name: e.target.value })}
                placeholder="e.g., Ahmed's Pizza"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Business Type</Label>
              <Select
                value={agentData.business_type}
                onValueChange={(value) => onUpdate({ business_type: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.icon} {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2">Business Description</Label>
              <Textarea
                value={agentData.business_description}
                onChange={(e) => onUpdate({ business_description: e.target.value })}
                placeholder="Tell us about your business..."
                rows={4}
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={() => {
                // Update first message based on business setup
                const businessName = agentData.business_name || 'your business';
                let updatedFirstMessage = agentData.first_message;
                
                // Generate business-type specific greeting if still using default or generic message
                if (!updatedFirstMessage || 
                    updatedFirstMessage.includes('My Business') || 
                    updatedFirstMessage === "Thank you for calling My Business! I can help you with reservations, menu questions, or provide information about our hours and location." ||
                    updatedFirstMessage.includes('How can I help you today?')) {
                  
                  const greetingTemplates: Record<string, string> = {
                    'restaurant': `Thank you for calling ${businessName}! Would you like to place an order, make a reservation, or hear about our menu?`,
                    'salon': `Thank you for calling ${businessName}! How can I help you book your perfect appointment today?`,
                    'medical': `Thank you for calling ${businessName}. How may I assist you today?`,
                    'real_estate': `Thank you for calling ${businessName}! Are you looking to buy, sell, or rent a property today?`,
                    'retail': `Thank you for calling ${businessName}! How can I help you find what you're looking for?`,
                    'fitness': `Thank you for calling ${businessName}! How can I help with your fitness goals today?`,
                    'automotive': `Thank you for calling ${businessName}! How can I assist with your automotive needs?`,
                    'legal': `Thank you for calling ${businessName}. How may I assist you today?`,
                    'education': `Thank you for calling ${businessName}! How can I help with your educational needs?`,
                    'technology': `Thank you for calling ${businessName}! How can I assist you with our technology services?`
                  };
                  
                  updatedFirstMessage = greetingTemplates[agentData.business_type] || `Thank you for calling ${businessName}! How can I help you today?`;
                }

                // Also update instructions to be business-specific
                let updatedInstructions = agentData.instructions;
                if (!updatedInstructions || updatedInstructions === "Friendly, welcoming, and knowledgeable about food and dining") {
                  const instructionTemplates: Record<string, string> = {
                    'restaurant': `You are a friendly and knowledgeable ${businessName} representative. Help customers with menu questions, take orders, make reservations, and provide information about hours and location. Always be welcoming and suggest popular items when appropriate.`,
                    'salon': `You are a professional ${businessName} representative. Help clients book appointments, answer questions about services and pricing, and provide information about stylists and availability. Always be courteous and helpful.`,
                    'medical': `You are a professional ${businessName} representative. Help patients schedule appointments, provide basic information about services, and direct urgent matters appropriately. Always maintain professionalism and patient privacy.`,
                    'real_estate': `You are a knowledgeable ${businessName} representative. Help clients with property inquiries, schedule viewings, connect them with agents, and provide market information. Always be professional and informative.`,
                    'retail': `You are a helpful ${businessName} representative. Assist customers with product information, store hours, locations, and direct them to the right department. Always be friendly and customer-focused.`,
                    'fitness': `You are an enthusiastic ${businessName} representative. Help members with class schedules, membership information, and fitness programs. Always be encouraging and supportive.`,
                    'automotive': `You are a knowledgeable ${businessName} representative. Help customers with service appointments, parts information, and general automotive needs. Always be professional and helpful.`,
                    'legal': `You are a professional ${businessName} representative. Help clients schedule consultations, provide basic information about services, and handle inquiries professionally. Always maintain confidentiality.`,
                    'education': `You are a helpful ${businessName} representative. Assist with enrollment information, course details, and scheduling. Always be informative and supportive.`,
                    'technology': `You are a knowledgeable ${businessName} representative. Help clients with technical questions, service information, and support needs. Always be clear and helpful.`
                  };
                  
                  updatedInstructions = instructionTemplates[agentData.business_type] || `You are a professional and helpful ${businessName} representative. Assist customers with their needs and provide excellent service.`;
                }
                
                // Update both first message and instructions
                onUpdate({
                  first_message: updatedFirstMessage,
                  instructions: updatedInstructions
                });
                
                // Trigger save if available
                if (onSave) {
                  onSave();
                }
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Template
            </Button>
          </div>
        );

      case 'personalityNode':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">System Instructions</Label>
              <Textarea
                value={agentData.instructions}
                onChange={(e) => onUpdate({ instructions: e.target.value })}
                placeholder="How should your AI behave?"
                rows={6}
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">First Message</Label>
              <Textarea
                value={agentData.first_message}
                onChange={(e) => onUpdate({ first_message: e.target.value })}
                placeholder="What should your AI say when someone calls?"
                rows={3}
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Custom Requirements</Label>
              <Textarea
                value={agentData.custom_requirements}
                onChange={(e) => onUpdate({ custom_requirements: e.target.value })}
                placeholder="Special instructions or requirements..."
                rows={3}
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
          </div>
        );

      case 'voiceNode':
        return (
          <div className="space-y-4">
            <Label className="text-white mb-2">Select Voice</Label>
            <div className="grid grid-cols-1 gap-3">
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => onUpdate({ voice: voice.id })}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    agentData.voice === voice.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <h4 className="font-semibold text-white">{voice.name}</h4>
                  <p className="text-gray-400 text-sm">{voice.description}</p>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-white mb-2">Language</Label>
              <Select
                value={agentData.language}
                onValueChange={(value) => onUpdate({ language: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="it-IT">Italian</SelectItem>
                  <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                  <SelectItem value="ja-JP">Japanese</SelectItem>
                  <SelectItem value="ko-KR">Korean</SelectItem>
                  <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'toolNode':
        // Special configuration for menu tool
        if (node.data.toolType === 'menu') {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <h4 className="text-white font-medium mb-2">Menu Configuration</h4>
                <p className="text-gray-300 text-sm">
                  Add your menu items with prices and descriptions
                </p>
              </div>
              
              {/* Menu Categories */}
              <div>
                <Label className="text-white mb-2">Menu Categories</Label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {['Appetizers', 'Main Courses', 'Desserts', 'Beverages', 'Specials'].map((cat) => (
                    <span 
                      key={cat}
                      className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-white"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bulk Import Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Import Menu</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBulkImport(!showBulkImport)}
                      className="bg-slate-700/50 border-gray-600 text-white hover:bg-slate-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Paste Menu
                    </Button>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processMenuImage(file);
                          }
                        }}
                        disabled={processingImage}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingImage}
                        className="bg-slate-700/50 border-gray-600 text-white hover:bg-slate-700 disabled:opacity-50 pointer-events-none"
                        asChild
                      >
                        <span className="pointer-events-auto cursor-pointer inline-flex items-center">
                          {processingImage ? (
                            <>
                              <div className="w-4 h-4 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-1" />
                              Upload Image
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                
                {showBulkImport && (
                  <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-gray-600">
                    <div>
                      <Label className="text-white mb-2">Paste Your Menu</Label>
                      <p className="text-sm text-gray-400 mb-2">
                        Paste your menu text below. Format example:<br/>
                        APPETIZERS:<br/>
                        Mozzarella Sticks - $8.99<br/>
                        Caesar Salad $12.99<br/>
                        <br/>
                        MAIN COURSES:<br/>
                        Grilled Salmon - $24.99<br/>
                        Chicken Parmesan $18.99
                      </p>
                      <Textarea
                        placeholder="Paste your menu here..."
                        value={bulkMenuText}
                        onChange={(e) => setBulkMenuText(e.target.value)}
                        rows={8}
                        className="bg-slate-900/50 border-gray-600 text-white font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const items = parseMenuText(bulkMenuText);
                          setMenuItems([...menuItems, ...items]);
                          setBulkMenuText('');
                          setShowBulkImport(false);
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Import Items
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBulkMenuText('');
                          setShowBulkImport(false);
                        }}
                        className="bg-slate-700/50 border-gray-600 text-white hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Menu Items ({menuItems.length})</Label>
                  <div className="flex gap-2">
                    {menuItems.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Clear all menu items?')) {
                            setMenuItems([]);
                          }
                        }}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        const newItem = {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          price: '',
                          category: 'Main Courses',
                          image: ''
                        };
                        setMenuItems([...menuItems, newItem]);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                </div>
                
                {isLoadingMenu && node.id === 'menu' ? (
                  // Loading skeleton
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-slate-700/50 rounded-lg border border-gray-600 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <div className="h-10 bg-slate-600/50 rounded mb-2"></div>
                              <div className="h-10 bg-slate-600/50 rounded"></div>
                            </div>
                            <div className="w-24">
                              <div className="h-10 bg-slate-600/50 rounded"></div>
                            </div>
                            <div className="w-8 h-8 bg-slate-600/50 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No menu items yet. Click "Add Item" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {menuItems.map((item, index) => (
                      <div key={item.id} className="p-4 bg-slate-700/50 rounded-lg border border-gray-600">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Input
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => {
                                  const updated = [...menuItems];
                                  updated[index].name = e.target.value;
                                  setMenuItems(updated);
                                }}
                                className="bg-slate-800/50 border-gray-600 text-white mb-2"
                              />
                              <Textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => {
                                  const updated = [...menuItems];
                                  updated[index].description = e.target.value;
                                  setMenuItems(updated);
                                }}
                                rows={2}
                                className="bg-slate-800/50 border-gray-600 text-white"
                              />
                            </div>
                            <div className="w-32">
                              <Input
                                placeholder="Price"
                                value={item.price}
                                onChange={(e) => {
                                  const updated = [...menuItems];
                                  updated[index].price = e.target.value;
                                  setMenuItems(updated);
                                }}
                                className="bg-slate-800/50 border-gray-600 text-white mb-2"
                              />
                              <Select 
                                value={item.category}
                                onValueChange={(value) => {
                                  const updated = [...menuItems];
                                  updated[index].category = value;
                                  setMenuItems(updated);
                                }}
                              >
                                <SelectTrigger className="bg-slate-800/50 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Appetizers">Appetizers</SelectItem>
                                  <SelectItem value="Main Courses">Main Courses</SelectItem>
                                  <SelectItem value="Desserts">Desserts</SelectItem>
                                  <SelectItem value="Beverages">Beverages</SelectItem>
                                  <SelectItem value="Specials">Specials</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setMenuItems(menuItems.filter((_, i) => i !== index));
                              }}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Save Menu Button */}
              <Button
                onClick={async () => {
                  try {
                    // First update the node with menu items
                    if (onUpdateNode) {
                      onUpdateNode({ menuItems });
                    }

                    // Generate AI tools based on menu configuration
                    if (menuItems.length > 0 && agentData.business_name && agentData.business_type) {
                      const toolResponse = await fetch('/api/tools/generate', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          businessData: {
                            name: agentData.business_name,
                            type: agentData.business_type,
                            description: agentData.business_description || `${agentData.business_name} - ${agentData.business_type}`,
                            requirements: 'Create intelligent tools for menu information and order management',
                          },
                          toolConfiguration: {
                            menuItems: menuItems,
                            menu: menuItems.map(item => 
                              `${item.name} - ${item.price} (${item.category}): ${item.description}`
                            ).join('\n'),
                          },
                        }),
                      });

                      if (toolResponse.ok) {
                        const { tools } = await toolResponse.json();
                        console.log('Generated AI tools:', tools);
                        
                        // Update the node with generated tools
                        if (onUpdateNode && tools.length > 0) {
                          onUpdateNode({ 
                            menuItems,
                            generatedTools: tools,
                            aiEnhanced: true,
                          });
                        }
                      }
                    }

                    // Trigger the main save to ensure everything is persisted to database
                    if (onSave) {
                      onSave();
                    }
                  } catch (error) {
                    console.error('Error generating AI tools:', error);
                    // Still save the menu items even if AI generation fails
                    if (onSave) {
                      onSave();
                    }
                  }
                }}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Menu Configuration
              </Button>
            </div>
          );
        }

        // Order tool configuration with Google Sheets
        if (node.data.toolType === 'order' || node.data.toolType === 'take-order') {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <h4 className="text-white font-medium mb-2">Order Management Configuration</h4>
                <p className="text-gray-300 text-sm">
                  Connect Google Sheets to manage and track customer orders
                </p>
              </div>
              
              <GoogleSheetsIntegration
                toolType="orders"
                businessName={agentData.business_name || 'Your Business'}
                initialConfig={{
                  sheetId: node.data.googleSheetId,
                  sheetUrl: node.data.googleSheetUrl,
                  sheetName: node.data.googleSheetName,
                  columnMappings: node.data.columnMappings,
                  isConnected: !!node.data.googleSheetId
                }}
                onSheetConnected={(config) => {
                  if (onUpdateNode) {
                    onUpdateNode({ 
                      googleSheetId: config.sheetId,
                      googleSheetUrl: config.sheetUrl,
                      googleSheetName: config.sheetName,
                      columnMappings: config.columnMappings,
                      configured: true
                    });
                  }
                }}
                onSheetDisconnected={() => {
                  if (onUpdateNode) {
                    onUpdateNode({ 
                      googleSheetId: null,
                      googleSheetUrl: null,
                      googleSheetName: null,
                      columnMappings: null,
                      configured: false
                    });
                  }
                }}
              />

              {node.data.googleSheetId && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-white mb-2">Order Information to Collect</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Customer Name', 'Phone Number', 'Delivery Address', 'Order Items', 'Special Instructions'].map((field) => (
                        <label key={field} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-gray-600 bg-slate-700/50"
                          />
                          <span className="text-sm text-white">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // FAQ tool configuration with Google Sheets
        if (node.data.toolType === 'faq' || node.data.toolType === 'answer-questions') {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-white font-medium mb-2">FAQ Configuration</h4>
                <p className="text-gray-300 text-sm">
                  Connect Google Sheets to manage frequently asked questions
                </p>
              </div>
              
              <GoogleSheetsIntegration
                toolType="faq"
                businessName={agentData.business_name || 'Your Business'}
                initialConfig={{
                  sheetId: node.data.googleSheetId,
                  sheetUrl: node.data.googleSheetUrl,
                  sheetName: node.data.googleSheetName,
                  columnMappings: node.data.columnMappings,
                  isConnected: !!node.data.googleSheetId
                }}
                onSheetConnected={(config) => {
                  if (onUpdateNode) {
                    onUpdateNode({ 
                      googleSheetId: config.sheetId,
                      googleSheetUrl: config.sheetUrl,
                      googleSheetName: config.sheetName,
                      columnMappings: config.columnMappings,
                      configured: true
                    });
                  }
                }}
                onSheetDisconnected={() => {
                  if (onUpdateNode) {
                    onUpdateNode({ 
                      googleSheetId: null,
                      googleSheetUrl: null,
                      googleSheetName: null,
                      columnMappings: null,
                      configured: false
                    });
                  }
                }}
              />

              {node.data.googleSheetId && (
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-white/80">
                    Your FAQ sheet is connected. The AI will use this sheet to answer customer questions.
                  </p>
                </div>
              )}
            </div>
          );
        }
        
        // Default tool configuration
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <h4 className="text-white font-medium mb-2">Tool Configuration</h4>
              <p className="text-gray-300 text-sm">
                Configure the settings for {node.data.label}
              </p>
            </div>
            
            <div>
              <Label className="text-white mb-2">API Endpoint</Label>
              <Input
                placeholder="https://api.example.com/endpoint"
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white mb-2">Authentication</Label>
              <Select defaultValue="none">
                <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="api-key">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2">Response Handling</Label>
              <Textarea
                placeholder="How should the AI handle responses from this tool?"
                rows={3}
                className="bg-slate-700/50 border-gray-600 text-white"
              />
            </div>
          </div>
        );

      case 'integrationNode':
        // AI-powered tools that don't need OAuth
        const aiPoweredTools = ['proposal-generator', 'competitor-analysis'];
        const isAiTool = aiPoweredTools.includes(node.data.integrationType);
        
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg border border-violet-500/30">
              <h4 className="text-white font-medium mb-2">
                {isAiTool ? 'AI Tool Configuration' : 'Integration Settings'}
              </h4>
              <p className="text-gray-300 text-sm">
                {isAiTool 
                  ? `Configure AI-powered ${node.data.label}`
                  : `Configure ${node.data.label} integration`
                }
              </p>
            </div>

            {/* Connection Status - Only for real integrations */}
            {!isAiTool && (
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Connection Status</span>
                  <span className={`text-sm ${
                    node.data.connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {node.data.connectionStatus === 'connected' ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                {node.data.connectionStatus !== 'connected' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => {
                      // Real OAuth flow
                      window.open(`/auth/${node.data.integrationType}`, '_blank', 'width=500,height=600');
                      
                      // Listen for OAuth success
                      window.addEventListener('message', (event) => {
                        if (event.data.type === 'oauth-success' && event.data.integration === node.data.integrationType) {
                          // Update node connection status
                          if (onUpdateNode) {
                            onUpdateNode({ connectionStatus: 'connected' });
                          }
                        }
                      });
                    }}
                  >
                    Connect {node.data.platform}
                  </Button>
                )}
              </div>
            )}
            
            {/* AI Tool Status */}
            {isAiTool && (
              <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">AI Status</span>
                  <span className="text-sm text-green-400">Ready to use</span>
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  This tool uses your agent's AI capabilities automatically.
                </p>
              </div>
            )}

            {/* Platform-specific settings */}
            {node.data.integrationType === 'crm-update' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Default Pipeline</Label>
                  <Select defaultValue="sales">
                    <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Pipeline</SelectItem>
                      <SelectItem value="marketing">Marketing Pipeline</SelectItem>
                      <SelectItem value="support">Support Pipeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white mb-2">Update Fields</Label>
                  <div className="space-y-2">
                    {['Pain Points', 'Budget', 'Timeline', 'Decision Criteria'].map((field) => (
                      <label key={field} className="flex items-center gap-2 text-white">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {node.data.integrationType === 'calendar-integration' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Default Meeting Duration</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white mb-2">Meeting Title Template</Label>
                  <Input
                    defaultValue="Demo Call - {Company Name}"
                    className="bg-slate-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}

            {node.data.integrationType === 'slack-notification' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Channel</Label>
                  <Select defaultValue="sales">
                    <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">#sales</SelectItem>
                      <SelectItem value="general">#general</SelectItem>
                      <SelectItem value="deals">#deals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white mb-2">Message Format</Label>
                  <Textarea
                    defaultValue="🎯 New discovery call completed with {Company}\n💰 Budget: {Budget}\n📅 Timeline: {Timeline}"
                    rows={3}
                    className="bg-slate-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}
            
            {/* AI Tool specific settings */}
            {node.data.integrationType === 'proposal-generator' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Proposal Style</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="executive">Executive Brief</SelectItem>
                      <SelectItem value="technical">Technical Detail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white mb-2">Include Sections</Label>
                  <div className="space-y-2">
                    {['Executive Summary', 'Solution Overview', 'Pricing', 'Timeline', 'Case Studies'].map((section) => (
                      <label key={section} className="flex items-center gap-2 text-white">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {node.data.integrationType === 'competitor-analysis' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Analysis Focus</Label>
                  <Select defaultValue="comprehensive">
                    <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="pricing">Pricing Only</SelectItem>
                      <SelectItem value="features">Features Only</SelectItem>
                      <SelectItem value="positioning">Market Positioning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white mb-2">Key Competitors</Label>
                  <Textarea
                    placeholder="Enter competitor names (one per line)"
                    rows={3}
                    className="bg-slate-700/50 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="w-96 h-full bg-slate-800/95 backdrop-blur-xl border-l border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{node.data.label}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Configuration Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderConfiguration()}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700 space-y-3">
        {onSave && (
          <Button 
            onClick={() => {
              // If we're saving business configuration, update AI templates
              if (node.type === 'businessNode' && agentData.business_name && agentData.business_type) {
                const businessName = agentData.business_name;
                let updatedFirstMessage = agentData.first_message;
                let updatedInstructions = agentData.instructions;
                
                // Generate business-type specific greeting if still using default or generic message
                if (!updatedFirstMessage || 
                    updatedFirstMessage.includes('My Business') || 
                    updatedFirstMessage === "Thank you for calling My Business! I can help you with reservations, menu questions, or provide information about our hours and location." ||
                    updatedFirstMessage.includes('How can I help you today?')) {
                  
                  const greetingTemplates: Record<string, string> = {
                    'restaurant': `Thank you for calling ${businessName}! Would you like to place an order, make a reservation, or hear about our menu?`,
                    'salon': `Thank you for calling ${businessName}! How can I help you book your perfect appointment today?`,
                    'medical': `Thank you for calling ${businessName}. How may I assist you today?`,
                    'real_estate': `Thank you for calling ${businessName}! Are you looking to buy, sell, or rent a property today?`,
                    'retail': `Thank you for calling ${businessName}! How can I help you find what you're looking for?`,
                    'fitness': `Thank you for calling ${businessName}! How can I help with your fitness goals today?`,
                    'automotive': `Thank you for calling ${businessName}! How can I assist with your automotive needs?`,
                    'legal': `Thank you for calling ${businessName}. How may I assist you today?`,
                    'education': `Thank you for calling ${businessName}! How can I help with your educational needs?`,
                    'technology': `Thank you for calling ${businessName}! How can I assist you with our technology services?`
                  };
                  
                  updatedFirstMessage = greetingTemplates[agentData.business_type] || `Thank you for calling ${businessName}! How can I help you today?`;
                }

                // Update instructions to be business-specific
                if (!updatedInstructions || updatedInstructions === "Friendly, welcoming, and knowledgeable about food and dining") {
                  const instructionTemplates: Record<string, string> = {
                    'restaurant': `You are a friendly and knowledgeable ${businessName} representative. Help customers with menu questions, take orders, make reservations, and provide information about hours and location. Always be welcoming and suggest popular items when appropriate.`,
                    'salon': `You are a professional ${businessName} representative. Help clients book appointments, answer questions about services and pricing, and provide information about stylists and availability. Always be courteous and helpful.`,
                    'medical': `You are a professional ${businessName} representative. Help patients schedule appointments, provide basic information about services, and direct urgent matters appropriately. Always maintain professionalism and patient privacy.`,
                    'real_estate': `You are a knowledgeable ${businessName} representative. Help clients with property inquiries, schedule viewings, connect them with agents, and provide market information. Always be professional and informative.`,
                    'retail': `You are a helpful ${businessName} representative. Assist customers with product information, store hours, locations, and direct them to the right department. Always be friendly and customer-focused.`,
                    'fitness': `You are an enthusiastic ${businessName} representative. Help members with class schedules, membership information, and fitness programs. Always be encouraging and supportive.`,
                    'automotive': `You are a knowledgeable ${businessName} representative. Help customers with service appointments, parts information, and general automotive needs. Always be professional and helpful.`,
                    'legal': `You are a professional ${businessName} representative. Help clients schedule consultations, provide basic information about services, and handle inquiries professionally. Always maintain confidentiality.`,
                    'education': `You are a helpful ${businessName} representative. Assist with enrollment information, course details, and scheduling. Always be informative and supportive.`,
                    'technology': `You are a knowledgeable ${businessName} representative. Help clients with technical questions, service information, and support needs. Always be clear and helpful.`
                  };
                  
                  updatedInstructions = instructionTemplates[agentData.business_type] || `You are a professional and helpful ${businessName} representative. Assist customers with their needs and provide excellent service.`;
                }
                
                // Update both first message and instructions
                onUpdate({
                  first_message: updatedFirstMessage,
                  instructions: updatedInstructions
                });
              }
              
              // Call the original save function
              onSave();
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        )}
        
        {/* Show delete button only for tool and integration nodes */}
        {onDelete && (node.type === 'toolNode' || node.type === 'integrationNode') && (
          <Button 
            onClick={onDelete}
            variant="outline" 
            className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Component
          </Button>
        )}
      </div>
    </motion.div>
  );
}