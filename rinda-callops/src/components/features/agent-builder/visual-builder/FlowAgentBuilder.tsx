'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import './flow-builder.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Users, 
  Mic, 
  Zap, 
  MessageSquare,
  Settings,
  Save,
  Play,
  Plus,
  X,
  ChevronRight,
  Sparkles,
  Phone,
  Calendar,
  Database,
  Brain,
  FileText,
  Globe,
  Workflow,
  LayoutGrid,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessTemplates } from '@/lib/constants/business-templates';
import { AgentData, BusinessData } from '../types';
import NodeComponentLibrary from './NodeComponentLibrary';
import { CustomToolBuilderModal } from './NodeComponentLibrary';
import ConfigurationPanel from './ConfigurationPanel';
import QuickStartTemplates from './QuickStartTemplates';
import IntegrationNode from './IntegrationNode';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TestAgentModal from './TestAgentModal';

// Add interface for props at the top after imports
interface FlowAgentBuilderProps {
  onSwitchToForm?: () => void;
  existingAgentId?: string;
}

// Custom Node Components
const BusinessNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br from-blue-500/90 to-purple-600/90 p-4 rounded-xl shadow-lg border-2 ${
        selected ? 'border-white shadow-2xl' : 'border-transparent'
      } min-w-[200px] cursor-pointer`}
    >
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Users className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white font-semibold">{data.label}</h3>
          <p className="text-white/70 text-sm">{data.businessType || 'Not configured'}</p>
        </div>
      </div>
    </motion.div>
  );
};

const PersonalityNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br from-green-500/90 to-blue-600/90 p-4 rounded-xl shadow-lg border-2 ${
        selected ? 'border-white shadow-2xl' : 'border-transparent'
      } min-w-[200px] cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Bot className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white font-semibold">{data.label}</h3>
          <p className="text-white/70 text-sm">{data.configured ? 'Configured' : 'Setup required'}</p>
        </div>
      </div>
    </motion.div>
  );
};

const VoiceNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br from-purple-500/90 to-pink-600/90 p-4 rounded-xl shadow-lg border-2 ${
        selected ? 'border-white shadow-2xl' : 'border-transparent'
      } min-w-[200px] cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Mic className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white font-semibold">{data.label}</h3>
          <p className="text-white/70 text-sm">{data.voice || 'Select voice'}</p>
        </div>
      </div>
    </motion.div>
  );
};

const ToolNode = ({ data, selected }: NodeProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br from-orange-500/90 to-red-600/90 p-4 rounded-xl shadow-lg border-2 ${
        selected ? 'border-white shadow-2xl' : 'border-transparent'
      } min-w-[180px] cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-white font-semibold">{data.label}</h3>
          <p className="text-white/70 text-sm">{data.toolType}</p>
        </div>
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  businessNode: BusinessNode,
  personalityNode: PersonalityNode,
  voiceNode: VoiceNode,
  toolNode: ToolNode,
  integrationNode: IntegrationNode,
};

const voiceOptions = [
  { id: 'ash', name: 'Ash', description: 'Deep, masculine voice' },
  { id: 'ballad', name: 'Ballad', description: 'British professional voice' },
  { id: 'coral', name: 'Coral', description: 'Warm, feminine voice' },
  { id: 'sage', name: 'Sage', description: 'Wise, professional voice' },
  { id: 'verse', name: 'Verse', description: 'Melodic, feminine voice' },
];

function FlowAgentBuilderContent({ onSwitchToForm, existingAgentId: propAgentId }: FlowAgentBuilderProps) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();
  // Use prop agentId if provided, otherwise fallback to URL search params for backward compatibility
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const existingAgentId = propAgentId || searchParams.get('id');
  const shouldOpenTestModal = searchParams.get('test') === 'true';
  const [showTemplates, setShowTemplates] = useState(!existingAgentId);
  const [showTestModal, setShowTestModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(existingAgentId);
  const [showCustomToolBuilder, setShowCustomToolBuilder] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      type: 'businessNode',
      position: { x: 100, y: 200 },
      data: { label: 'Business Setup', businessType: null }
    },
    {
      id: '2',
      type: 'personalityNode',
      position: { x: 400, y: 200 },
      data: { label: 'AI Personality', configured: false }
    },
    {
      id: '3',
      type: 'voiceNode',
      position: { x: 700, y: 200 },
      data: { label: 'Voice Settings', voice: null }
    }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [agentData, setAgentData] = useState<AgentData>({
    name: '',
    business_name: '',
    business_type: 'restaurant',
    business_description: '',
    custom_requirements: '',
    instructions: '',
    first_message: '',
    voice: 'ash',
    language: 'en-US'
  });

  const reactFlowInstance = useReactFlow();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing agent if ID is provided
  useEffect(() => {
    if (existingAgentId && user) {
      loadExistingAgent();
    }
  }, [existingAgentId, user, getIdToken]);

  // Open test modal if test=true query parameter is present
  useEffect(() => {
    if (shouldOpenTestModal && existingAgentId) {
      // Wait a bit for the agent to load, then open the test modal
      const timer = setTimeout(() => {
        setShowTestModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldOpenTestModal, existingAgentId]);

  const loadExistingAgent = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/agents/${existingAgentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const agent = await response.json();
        
        // Update agent data
        setAgentData({
          name: agent.name || '',
          business_name: agent.business_name || '',
          business_type: agent.business_type || 'restaurant',
          business_description: agent.business_description || '',
          custom_requirements: agent.custom_requirements || '',
          instructions: agent.instructions || '',
          first_message: agent.first_message || '',
          voice: agent.voice || 'ash',
          language: agent.language || 'en-US'
        });

        // Load nodes and edges if they exist, then apply visual updates
        if (agent.nodes && agent.nodes.length > 0) {
          // First set the nodes from database
          const loadedNodes = agent.nodes.map((node: any) => {
            // Preserve all data from database, including menuItems
            const updatedNode = { ...node };
            
            // Apply visual updates without losing data
            if (node.id === '1' && agent.business_type) {
              const template = businessTemplates.find(t => t.id === agent.business_type);
              updatedNode.data = {
                ...node.data, // Preserve existing data from database
                businessType: template ? template.name : agent.business_type
              };
            }
            if (node.id === '2' && (agent.instructions || agent.first_message)) {
              updatedNode.data = {
                ...node.data, // Preserve existing data from database
                configured: true
              };
            }
            if (node.id === '3' && agent.voice) {
              const voice = voiceOptions.find(v => v.id === agent.voice);
              updatedNode.data = {
                ...node.data, // Preserve existing data from database
                voice: voice ? voice.name : agent.voice
              };
            }
            return updatedNode;
          });
          
          setNodes(loadedNodes);
        }
        if (agent.edges && agent.edges.length > 0) {
          setEdges(agent.edges);
        }
        
        // Hide templates since we loaded an existing agent
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Error loading existing agent:', error);
    }
  };

  // Center and fit view when nodes change
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          maxZoom: 0.8,
          duration: 500
        });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);
  
  // Auto-save functionality
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't auto-save if we don't have minimum required data
    if (!agentData.name || !agentData.business_name) {
      return;
    }

    // Set a new timeout to save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      createOrUpdateAgent(false);
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [agentData, nodes, edges]); // Re-run when agent data, nodes, or edges change

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  const onNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const reactFlowBounds = event.target.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (data) {
        const parsedData = JSON.parse(data);
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${parsedData.type}-${Date.now()}`,
          type: parsedData.type,
          position,
          data: parsedData.type === 'integrationNode' 
            ? {
                label: parsedData.label,
                integrationType: parsedData.integrationType,
                platform: parsedData.platform,
                connectionStatus: parsedData.connectionStatus
              }
            : {
                label: parsedData.label,
                toolType: parsedData.toolType
              },
        };

        setNodes((nds) => nds.concat(newNode));

        // Auto-connect to personality node if it's a tool or integration
        if (parsedData.type === 'toolNode' || parsedData.type === 'integrationNode') {
          const newEdge: Edge = {
            id: `e2-${newNode.id}`,
            source: '2',
            target: newNode.id,
            animated: true,
          };
          setEdges((eds) => eds.concat(newEdge));
        }
      }
    },
    [reactFlowInstance]
  );

  const addToolNode = (toolType: string, toolName: string, toolData?: any) => {
    const newNode: Node = {
      id: `tool-${Date.now()}`,
      type: 'toolNode',
      position: { x: 500, y: 350 + nodes.filter(n => n.type === 'toolNode').length * 100 },
      data: toolData || { label: toolName, toolType }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Connect to personality node
    const newEdge: Edge = {
      id: `e2-${newNode.id}`,
      source: '2',
      target: newNode.id,
      animated: true
    };
    
    setEdges((eds) => [...eds, newEdge]);
    setShowLibrary(false);
  };

  const selectedNodeData = useMemo(() => {
    return nodes.find(n => n.id === selectedNode);
  }, [nodes, selectedNode]);

  const handleTemplateSelect = (template: any) => {
    if (template) {
      const businessName = agentData.business_name || 'My Business';
      setAgentData({
        ...agentData,
        name: `${template.name} Agent`,
        business_name: businessName,
        business_type: template.id,
        first_message: template.preConfigured.greeting.replace(/{businessName}/g, businessName),
        instructions: template.preConfigured.personality
      });

      // Update the business node with business type
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '1') {
            return {
              ...node,
              data: {
                ...node.data,
                businessType: template.name
              }
            };
          }
          return node;
        })
      );

      // Determine which tools are integrations
      const integrationTools = ['crm-update', 'calendar-integration', 'slack-notification', 'proposal-generator', 'competitor-analysis'];
      
      // Add tool nodes for the template
      const toolNodes = template.preConfigured.tools.map((toolId: string, index: number) => {
        const isIntegration = integrationTools.includes(toolId);
        const platformMap: Record<string, string> = {
          'crm-update': 'Salesforce',
          'calendar-integration': 'Google Calendar',
          'slack-notification': 'Slack',
          'proposal-generator': 'AI Generator',
          'competitor-analysis': 'Market Analysis'
        };
        
        return {
          id: `tool-${toolId}`,
          type: isIntegration ? 'integrationNode' : 'toolNode',
          position: { x: 500, y: 350 + index * 100 },
          data: {
            label: toolId.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            toolType: toolId,
            integrationType: toolId,
            platform: platformMap[toolId],
            connectionStatus: 'disconnected'
          }
        };
      });

      setNodes((nds) => [...nds, ...toolNodes]);

      // Connect tools to personality node
      const toolEdges = toolNodes.map((node: any) => ({
        id: `e2-${node.id}`,
        source: '2',
        target: node.id,
        animated: true
      }));

      setEdges((eds) => [...eds, ...toolEdges]);
    }
    setShowTemplates(false);
  };

  const createOrUpdateAgent = async (showAlert = false) => {
    try {
      if (!user) return;
      
      const token = await getIdToken();
      
      // Extract tools from nodes
      const tools = nodes
        .filter(n => n.type === 'toolNode')
        .map(n => {
          const toolId = n.data.toolType || n.id;
          
          // Base tool data
          const baseToolData = {
            id: toolId,
            name: n.data.label,
            type: 'reference'
          };
          
          // Handle Google Sheets configuration for order/FAQ tools
          if ((toolId === 'order' || toolId === 'take-order' || toolId === 'faq' || toolId === 'answer-questions') 
              && n.data.googleSheetId) {
            
            // For order tools, create as AI-generated tools with Google Sheets integration
            if (toolId === 'order' || toolId === 'take-order') {
              // Create an AI-generated tool that can extract parameters and save to sheets
              const orderTool = {
                name: toolId,
                displayName: n.data.label,
                description: "Process customer orders by extracting order details from conversation and saving them to Google Sheets",
                type: "function",
                json_schema: {
                  type: "object",
                  properties: {
                    customer_name: {
                      type: "string",
                      description: "Full name of the customer placing the order"
                    },
                    phone_number: {
                      type: "string", 
                      description: "Customer's phone number for contact"
                    },
                    items: {
                      type: "string",
                      description: "Complete list of items being ordered with quantities (e.g., '2 donuts, 1 pizza')"
                    },
                    total_amount: {
                      type: "string",
                      description: "Total cost of the order if mentioned"
                    },
                    delivery_address: {
                      type: "string",
                      description: "Delivery address if this is a delivery order"
                    },
                    notes: {
                      type: "string", 
                      description: "Any special instructions or notes for the order"
                    }
                  },
                  required: ["customer_name", "items"]
                },
                configuration: {
                  googleSheetId: n.data.googleSheetId,
                  googleSheetUrl: n.data.googleSheetUrl,
                  googleSheetName: n.data.googleSheetName,
                  columnMappings: n.data.columnMappings
                }
              };
              
              return {
                ...baseToolData,
                type: 'ai_generated',
                generatedTools: [orderTool],
                aiEnhanced: true,
                googleSheetId: n.data.googleSheetId,
                googleSheetUrl: n.data.googleSheetUrl,
                googleSheetName: n.data.googleSheetName,
                columnMappings: n.data.columnMappings,
                configured: true
              };
            } else {
              // FAQ tools remain as reference tools
              const jsonSchema = {
                type: "object",
                properties: {
                  question: {
                    type: "string",
                    description: "The customer's question or inquiry"
                  },
                  category: {
                    type: "string",
                    description: "Category of the question (e.g., 'hours', 'menu', 'pricing', 'services')"
                  }
                },
                required: ["question"],
                description: "Search FAQ database for answers to customer questions"
              };
              
              return {
                ...baseToolData,
                googleSheetId: n.data.googleSheetId,
                googleSheetUrl: n.data.googleSheetUrl,
                googleSheetName: n.data.googleSheetName,
                columnMappings: n.data.columnMappings,
                configured: true,
                json_schema: jsonSchema
              };
            }
          }
          
          // Handle menu tool with its items
          if (toolId === 'menu' && n.data.menuItems) {
            const menuToolData = {
              ...baseToolData,
              type: 'menu',
              menuItems: n.data.menuItems
            };
            
            // If AI tools were generated for this menu, include them
            if (n.data.generatedTools && n.data.aiEnhanced) {
              return {
                ...menuToolData,
                generatedTools: n.data.generatedTools,
                aiEnhanced: true
              };
            }
            
            return menuToolData;
          }
          
          // Handle AI-generated tools
          if (n.data.generatedTools && n.data.aiEnhanced) {
            return {
              ...baseToolData,
              type: 'ai_generated',
              generatedTools: n.data.generatedTools,
              aiEnhanced: true,
              // Include original configuration data if present
              ...(n.data.menuItems && { menuItems: n.data.menuItems }),
              ...(n.data.googleSheetId && { 
                googleSheetId: n.data.googleSheetId,
                googleSheetUrl: n.data.googleSheetUrl,
                googleSheetName: n.data.googleSheetName,
                columnMappings: n.data.columnMappings,
              }),
            };
          }
          
          if (n.data.json_schema) {
            return {
              ...n.data,
              id: toolId,
              type: 'function'
            };
          }
          
          return baseToolData;
        });

      console.log('Saving tools with configuration:', tools);

      // Create different payloads for create vs update
      const agentPayload = agentId ? {
        // Update payload - tools should be string IDs
        name: agentData.name || 'Untitled Agent',
        business_name: agentData.business_name,
        business_type: agentData.business_type,
        instructions: agentData.instructions,
        first_message: agentData.first_message,
        voice: agentData.voice,
        language: agentData.language,
        tools: tools, // Full objects with configuration for updates
        status: 'draft',
        nodes: nodes,
        edges: edges,
        integrations: nodes
          .filter(n => n.type === 'integrationNode')
          .map(n => ({
            id: n.id,
            type: n.data.integrationType,
            platform: n.data.platform,
            connectionStatus: n.data.connectionStatus,
            config: n.data.config || {}
          }))
      } : {
        // Create payload - tools should be objects
        name: agentData.name || 'Untitled Agent',
        business_name: agentData.business_name,
        business_type: agentData.business_type,
        business_description: agentData.business_description,
        custom_requirements: agentData.custom_requirements,
        instructions: agentData.instructions,
        first_message: agentData.first_message,
        voice: agentData.voice,
        language: agentData.language,
        tools: tools, // Full objects for creation
        nodes: nodes,
        edges: edges,
        integrations: nodes
          .filter(n => n.type === 'integrationNode')
          .map(n => ({
            id: n.id,
            type: n.data.integrationType,
            platform: n.data.platform,
            connectionStatus: n.data.connectionStatus,
            config: n.data.config || {}
          }))
      };

      const response = await fetch(
        agentId ? `/api/agents/${agentId}` : '/api/agents',
        {
          method: agentId ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentPayload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save agent');
      }

      const data = await response.json();
      
      if (!agentId) {
        setAgentId(data.id);
        // Update URL to include the agent ID
        const newUrl = `${window.location.pathname}?id=${data.id}`;
        window.history.replaceState({}, '', newUrl);
      }
      
      if (showAlert) {
        alert('Agent saved successfully!');
      }
      
      return data;
    } catch (error) {
      console.error('Error saving agent:', error);
      if (showAlert) {
        alert('Failed to save agent. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await createOrUpdateAgent(true);
    setSaving(false);
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      
      // Save first to ensure we have an agent ID
      const savedAgent = await createOrUpdateAgent(false);
      if (!savedAgent) {
        throw new Error('Failed to save agent before deploying');
      }
      
      const token = await getIdToken();
      
      // Update agent status to active
      const response = await fetch(`/api/agents/${savedAgent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy agent');
      }

      alert('Agent deployed successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deploying agent:', error);
      alert('Failed to deploy agent. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  const handleTest = () => {
    setShowTestModal(true);
  };

  if (showTemplates && !existingAgentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
        <QuickStartTemplates onSelectTemplate={handleTemplateSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Left Sidebar - Component Library */}
        <AnimatePresence>
          {showLibrary && (
            <NodeComponentLibrary 
              onClose={() => setShowLibrary(false)}
              onAddNode={addToolNode}
              onOpenCustomToolBuilder={() => setShowCustomToolBuilder(true)}
              businessType={agentData.business_type}
            />
          )}
        </AnimatePresence>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-slate-900 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {agentData.business_name || 'Visual Agent Builder'}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-white/70">
                      {existingAgentId ? 'Edit your AI agent' : 'Drag and drop components to build your AI agent'}
                    </p>
                    {existingAgentId && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-yellow-400 font-medium">DRAFT</span>
                        </div>
                        {agentData.business_type && (
                          <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                            {agentData.business_type}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-slate-800/90 backdrop-blur-xl p-1 rounded-lg border border-gray-700 mr-4">
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Workflow className="w-4 h-4 mr-2" />
                    Visual Builder
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSwitchToForm ? onSwitchToForm() : window.location.reload()}
                    className="text-white hover:bg-white/10"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Classic Form
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowLibrary(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </Button>
                <Button
                  onClick={handleTest}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={!agentData.name || !agentData.business_name}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Agent
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  disabled={saving || !agentData.name || !agentData.business_name}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={deploying || !agentData.name || !agentData.business_name}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {deploying ? 'Deploying...' : 'Deploy'}
                </Button>
              </div>
            </div>
          </div>

          {/* Flow Canvas */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              maxZoom: 1,
              minZoom: 0.5
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            minZoom={0.2}
            maxZoom={2}
            className="bg-slate-900/50"
          >
            <Background color="#334155" gap={20} />
            <Controls 
              className="!bg-slate-800 !text-white !border !border-gray-700"
              style={{ 
                backgroundColor: 'rgb(30, 41, 59)',
                borderRadius: '0.5rem'
              }}
            />
            <MiniMap 
              style={{
                backgroundColor: 'rgb(30, 41, 59)',
                border: '1px solid rgb(55, 65, 81)',
                borderRadius: '0.5rem',
                width: 200,
                height: 150
              }}
              nodeColor={(node) => {
                switch (node.type) {
                  case 'businessNode':
                    return 'rgba(59, 130, 246, 0.8)';
                  case 'personalityNode':
                    return 'rgba(16, 185, 129, 0.8)';
                  case 'voiceNode':
                    return 'rgba(168, 85, 247, 0.8)';
                  case 'integrationNode':
                    return 'rgba(139, 92, 246, 0.8)';
                  case 'toolNode':
                    return 'rgba(249, 115, 22, 0.8)';
                  default:
                    return 'rgba(107, 114, 128, 0.8)';
                }
              }}
              nodeStrokeColor={(node) => {
                switch (node.type) {
                  case 'businessNode':
                    return '#1e40af';
                  case 'personalityNode':
                    return '#047857';
                  case 'voiceNode':
                    return '#7c3aed';
                  case 'integrationNode':
                    return '#6d28d9';
                  case 'toolNode':
                    return '#c2410c';
                  default:
                    return '#374151';
                }
              }}
              nodeStrokeWidth={1}
              maskColor="rgba(96, 165, 250, 0.15)"
              maskStrokeColor="rgba(96, 165, 250, 0.5)"
              maskStrokeWidth={2}
              pannable={true}
              zoomable={true}
              inversePan={false}
              zoomStep={10}
            />
          </ReactFlow>
        </div>

        {/* Right Sidebar - Configuration Panel */}
        <AnimatePresence>
          {selectedNodeData && (
            <ConfigurationPanel
              node={selectedNodeData}
              agentData={agentData}
              onUpdate={(updates) => {
                setAgentData({ ...agentData, ...updates });
                // Update node data based on the type of node and updates
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === selectedNode) {
                      // Update visual indicators based on node type
                      let updatedData = { ...node.data };
                      
                      if (node.type === 'businessNode' && updates.business_type) {
                        const template = businessTemplates.find(t => t.id === updates.business_type);
                        updatedData.businessType = template ? template.name : updates.business_type;
                      }
                      
                      if (node.type === 'personalityNode' && (updates.instructions || updates.first_message)) {
                        updatedData.configured = true;
                      }
                      
                      if (node.type === 'voiceNode' && updates.voice) {
                        const voice = voiceOptions.find(v => v.id === updates.voice);
                        updatedData.voice = voice ? voice.name : updates.voice;
                      }
                      
                      return {
                        ...node,
                        data: updatedData
                      };
                    }
                    return node;
                  })
                );
              }}
              onClose={() => setSelectedNode(null)}
              onDelete={() => {
                if (selectedNode && !['1', '2', '3'].includes(selectedNode)) {
                  deleteNode(selectedNode);
                }
              }}
              onUpdateNode={(nodeUpdates) => {
                // Update node data directly
                setNodes((nds) =>
                  nds.map((node) => {
                    if (node.id === selectedNode) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          ...nodeUpdates
                        }
                      };
                    }
                    return node;
                  })
                );
              }}
              onSave={handleSave}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Custom Tool Builder Modal - Rendered outside sidebar */}
      <CustomToolBuilderModal
        isOpen={showCustomToolBuilder}
        onClose={() => setShowCustomToolBuilder(false)}
        onAddTool={addToolNode}
        businessType={agentData.business_type}
      />

      {/* Test Agent Modal */}
      <TestAgentModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        agentData={agentData}
        agentId={agentId || undefined}
      />
    </div>
  );
}

export default function FlowAgentBuilder({ onSwitchToForm, existingAgentId }: FlowAgentBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowAgentBuilderContent onSwitchToForm={onSwitchToForm} existingAgentId={existingAgentId} />
    </ReactFlowProvider>
  );
}