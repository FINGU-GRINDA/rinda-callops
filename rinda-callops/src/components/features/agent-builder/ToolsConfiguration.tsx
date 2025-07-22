'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Plus, Trash2, Code, Loader2 } from 'lucide-react';
import { ToolGenerator } from '@/services/tool-generator';
import { toast } from 'react-hot-toast';

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

interface ToolsConfigurationProps {
  businessContext: {
    businessName: string;
    industry: string;
    description: string;
  };
  existingTools: Tool[];
  onUpdate: (tools: Tool[]) => void;
}

export default function ToolsConfiguration({ businessContext, existingTools, onUpdate }: ToolsConfigurationProps) {
  const [tools, setTools] = useState<Tool[]>(existingTools || []);
  const [generating, setGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    onUpdate(tools);
  }, [tools]);

  const generateTools = async () => {
    if (!businessContext.businessName || !businessContext.industry) {
      toast.error('Please complete business setup first');
      return;
    }

    setGenerating(true);
    try {
      const generatedTools = await ToolGenerator.generateToolsFromDescription({
        businessName: businessContext.businessName,
        businessType: businessContext.industry,
        businessDescription: businessContext.description,
        industry: businessContext.industry,
        description: businessContext.description,
        existingTools: tools.map(t => t.name)
      });

      const newTools = generatedTools.map(t => t.function!).filter(Boolean);
      setTools(newTools);
      toast.success(`Generated ${newTools.length} tools for your business!`);
    } catch (error) {
      console.error('Error generating tools:', error);
      toast.error('Failed to generate tools. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const addCustomTool = () => {
    const newTool: Tool = {
      name: 'custom_tool',
      description: 'Custom tool description',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    };
    setTools([...tools, newTool]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, updatedTool: Tool) => {
    const updated = [...tools];
    updated[index] = updatedTool;
    setTools(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Tools & Actions
          </CardTitle>
          <CardDescription>
            Configure tools that allow your AI agent to perform actions like booking appointments or taking orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={generateTools}
              disabled={generating || !businessContext.businessName}
              className="flex-1"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tools...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Tools for {businessContext.industry || 'Business'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={addCustomTool}
              disabled={generating}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Tool
            </Button>
          </div>

          {tools.length === 0 && !generating && (
            <div className="text-center py-8 text-gray-500">
              <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tools configured yet.</p>
              <p className="text-sm mt-2">Click "Generate Tools" to automatically create tools based on your business.</p>
            </div>
          )}

          <div className="space-y-4">
            {tools.map((tool, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {tool.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTool(index)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {tool.parameters?.properties && Object.keys(tool.parameters.properties).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Parameters:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(tool.parameters.properties).map(([key, value]: [string, any]) => (
                          <Badge key={key} variant="secondary">
                            {key}: {value.type}
                            {tool.parameters.required?.includes(key) && '*'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSelectedTool(tool)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTool && (
        <Card>
          <CardHeader>
            <CardTitle>Tool Details: {selectedTool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">
                {JSON.stringify(selectedTool, null, 2)}
              </code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}