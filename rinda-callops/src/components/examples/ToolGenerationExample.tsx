'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Code } from 'lucide-react';
import { generateAITools, type BusinessData, type ToolConfiguration, type GeneratedTool } from '@/lib/api/tools';
import { useAuth } from '@/contexts/AuthContext';

export default function ToolGenerationExample() {
  const { getIdToken } = useAuth();
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    type: 'restaurant',
    description: '',
    requirements: ''
  });
  const [toolConfiguration, setToolConfiguration] = useState<ToolConfiguration>({});
  const [generatedTools, setGeneratedTools] = useState<GeneratedTool[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTools = async () => {
    if (!businessData.name || !businessData.description) {
      setError('Please fill in business name and description');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const token = await getIdToken();
      const result = await generateAITools({
        businessData,
        toolConfiguration
      }, token);
      
      setGeneratedTools(result.tools);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tools');
    } finally {
      setGenerating(false);
    }
  };

  const updateConfiguration = (key: string, value: any) => {
    setToolConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Tool Generation Example
          </CardTitle>
          <CardDescription>
            Test the new /api/tools/generate endpoint by creating AI tools for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Data Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessData.name}
                onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mario's Italian Bistro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={businessData.type}
                onValueChange={(value) => setBusinessData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="salon">Salon/Spa</SelectItem>
                  <SelectItem value="medical">Medical Clinic</SelectItem>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="service">Service Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              id="businessDescription"
              value={businessData.description}
              onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your business does, services offered, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">AI Requirements</Label>
            <Textarea
              id="requirements"
              value={businessData.requirements}
              onChange={(e) => setBusinessData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="What should your AI be able to do? e.g., Take orders, Book appointments, Answer questions"
              rows={2}
            />
          </div>

          {/* Tool Configuration */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Tool Configuration (Optional)</h3>
            
            {businessData.type === 'restaurant' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menu">Menu Items</Label>
                  <Textarea
                    id="menu"
                    value={toolConfiguration.menu || ''}
                    onChange={(e) => updateConfiguration('menu', e.target.value)}
                    placeholder="List your menu items with prices, e.g.:\nMargherita Pizza - $12.99\nPepperoni Pizza - $14.99"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {businessData.type === 'salon' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="services">Services</Label>
                  <Textarea
                    id="services"
                    value={toolConfiguration.services || ''}
                    onChange={(e) => updateConfiguration('services', e.target.value)}
                    placeholder="List your services, e.g.:\nHaircuts, Hair coloring, Manicures, Pedicures"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {businessData.type === 'medical' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctors">Doctors/Staff</Label>
                  <Input
                    id="doctors"
                    value={toolConfiguration.doctors?.join(', ') || ''}
                    onChange={(e) => updateConfiguration('doctors', e.target.value.split(', ').filter(Boolean))}
                    placeholder="Dr. Smith, Dr. Johnson, Dr. Williams"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerateTools}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating AI Tools...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate AI Tools
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Tools Display */}
      {generatedTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Generated Tools ({generatedTools.length})
            </CardTitle>
            <CardDescription>
              These tools were generated by the AI based on your business data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedTools.map((tool, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{tool.displayName}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{tool.name}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{tool.description}</p>
                    
                    {tool.json_schema?.properties && Object.keys(tool.json_schema.properties).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Parameters:</p>
                        <div className="space-y-1">
                          {Object.entries(tool.json_schema.properties).map(([key, prop]: [string, any]) => (
                            <div key={key} className="text-xs bg-gray-50 px-2 py-1 rounded flex justify-between">
                              <span className="font-mono">{key}</span>
                              <span className="text-gray-500">
                                {prop.type}
                                {tool.json_schema.required?.includes(key) && ' (required)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tool.configuration && (
                      <details className="mt-3">
                        <summary className="text-sm font-medium cursor-pointer">Configuration</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(tool.configuration, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}