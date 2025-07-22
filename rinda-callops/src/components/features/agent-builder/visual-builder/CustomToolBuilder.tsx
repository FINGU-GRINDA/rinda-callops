import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Upload, FileText, Wand2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tool } from '../types';
import { useAuth } from '@/contexts/AuthContext';

interface CustomToolBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTool: (tool: Tool) => void;
  businessType: string;
}

interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export default function CustomToolBuilder({ isOpen, onClose, onAddTool, businessType }: CustomToolBuilderProps) {
  const { getIdToken } = useAuth();
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [parameters, setParameters] = useState<ToolParameter[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddParameter = () => {
    setParameters([...parameters, {
      name: '',
      type: 'string',
      description: '',
      required: false
    }]);
  };

  const handleUpdateParameter = (index: number, field: keyof ToolParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // If it's a menu or document, suggest AI generation
      if (file.type.includes('pdf') || file.type.includes('image')) {
        setAiPrompt(`Create a tool to query information from this ${file.name.includes('menu') ? 'menu' : 'document'}`);
        setMode('ai');
      }
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      setGenerating(true);
      const token = await getIdToken();
      
      // Upload file if provided
      let fileData = null;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const uploadResponse = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (uploadResponse.ok) {
          fileData = await uploadResponse.json();
        }
      }
      
      // Call backend tool generator
      const response = await fetch('/api/tools/generate-smart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_type: businessType,
          business_name: 'Custom Business',
          business_description: aiPrompt,
          requirements: aiPrompt,
          file_analysis_results: fileData,
          additional_data: {}
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate tools');
      }
      
      const { tools } = await response.json();
      if (tools && tools.length > 0) {
        const generatedTool = tools[0];
        
        // Switch to manual mode and populate fields
        setMode('manual');
        setToolName(generatedTool.name);
        setToolDescription(generatedTool.description);
        
        // Convert parameters from json_schema format
        if (generatedTool.json_schema?.function?.parameters?.properties) {
          const params: ToolParameter[] = [];
          const required = generatedTool.json_schema.function.parameters.required || [];
          
          Object.entries(generatedTool.json_schema.function.parameters.properties).forEach(([name, prop]: [string, any]) => {
            params.push({
              name,
              type: prop.type || 'string',
              description: prop.description || '',
              required: required.includes(name)
            });
          });
          
          setParameters(params);
        }
      }
    } catch (error) {
      console.error('Error generating tool:', error);
      alert('Failed to generate tool. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateTool = () => {
    if (!toolName || !toolDescription) {
      alert('Please provide tool name and description');
      return;
    }

    const tool: Tool = {
      name: toolName.toLowerCase().replace(/\s+/g, '_'),
      display_name: toolName,
      description: toolDescription,
      type: 'function',
      enabled: true,
      json_schema: {
        type: 'function',
        function: {
          name: toolName.toLowerCase().replace(/\s+/g, '_'),
          description: toolDescription,
          parameters: {
            type: 'object',
            properties: parameters.reduce((acc, param) => {
              if (param.name) {
                acc[param.name] = {
                  type: param.type,
                  description: param.description
                };
              }
              return acc;
            }, {} as Record<string, any>),
            required: parameters.filter(p => p.required && p.name).map(p => p.name)
          }
        }
      }
    };

    onAddTool(tool);
    
    // Reset form
    setToolName('');
    setToolDescription('');
    setParameters([]);
    setAiPrompt('');
    setUploadedFile(null);
    onClose();
  };

  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-slate-900 border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Create Custom Tool</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Mode Selection */}
                <div className="flex gap-4 mb-6">
                  <Button
                    variant={mode === 'ai' ? 'default' : 'outline'}
                    onClick={() => setMode('ai')}
                    className={mode === 'ai' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                  <Button
                    variant={mode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setMode('manual')}
                    className={mode === 'manual' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Manual Create
                  </Button>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <Label className="text-white mb-2">Upload Document (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">
                        {uploadedFile ? uploadedFile.name : 'Upload menu, price list, or other documents'}
                      </p>
                    </label>
                  </div>
                </div>

                {mode === 'ai' ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2">Describe what this tool should do</Label>
                      <Textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Example: Create a tool that can search through our restaurant menu and answer questions about dishes, prices, and dietary restrictions"
                        rows={4}
                        className="bg-slate-800/50 border-gray-600 text-white"
                      />
                    </div>
                    
                    <Button
                      onClick={handleGenerateWithAI}
                      disabled={!aiPrompt || generating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {generating ? 'Generating...' : 'Generate Tool with AI'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Tool Name */}
                    <div>
                      <Label className="text-white mb-2">Tool Name</Label>
                      <Input
                        value={toolName}
                        onChange={(e) => setToolName(e.target.value)}
                        placeholder="e.g., Search Menu"
                        className="bg-slate-800/50 border-gray-600 text-white"
                      />
                    </div>

                    {/* Tool Description */}
                    <div>
                      <Label className="text-white mb-2">Tool Description</Label>
                      <Textarea
                        value={toolDescription}
                        onChange={(e) => setToolDescription(e.target.value)}
                        placeholder="What does this tool do?"
                        rows={3}
                        className="bg-slate-800/50 border-gray-600 text-white"
                      />
                    </div>

                    {/* Parameters */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-white">Parameters</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddParameter}
                          className="!text-white !border-gray-500 !bg-slate-700 hover:!bg-slate-600 hover:!text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Parameter
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {parameters.map((param, index) => (
                          <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-gray-600">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <Input
                                value={param.name}
                                onChange={(e) => handleUpdateParameter(index, 'name', e.target.value)}
                                placeholder="Parameter name"
                                className="bg-slate-700/50 border-gray-600 text-white"
                              />
                              <Select
                                value={param.type}
                                onValueChange={(value) => handleUpdateParameter(index, 'type', value)}
                              >
                                <SelectTrigger className="bg-slate-700/50 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                value={param.description}
                                onChange={(e) => handleUpdateParameter(index, 'description', e.target.value)}
                                placeholder="Description"
                                className="bg-slate-700/50 border-gray-600 text-white flex-1"
                              />
                              <label className="flex items-center gap-2 text-white">
                                <input
                                  type="checkbox"
                                  checked={param.required}
                                  onChange={(e) => handleUpdateParameter(index, 'required', e.target.checked)}
                                  className="rounded"
                                />
                                Required
                              </label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveParameter(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="!text-white !border-gray-500 !bg-slate-700 hover:!bg-slate-600 hover:!text-white"
                >
                  Cancel
                </Button>
                {mode === 'manual' && (
                  <Button
                    onClick={handleCreateTool}
                    disabled={!toolName || !toolDescription}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Tool
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}