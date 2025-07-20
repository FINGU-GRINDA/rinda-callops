'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic, Wand2, Volume2, PlayCircle } from 'lucide-react';
import { ToolGenerator } from '@/services/tool-generator';

const voices = [
  { id: 'alloy', name: 'Alloy (Balanced)', provider: 'openai' },
  { id: 'echo', name: 'Echo (Expressive)', provider: 'openai' },
  { id: 'fable', name: 'Fable (Energetic)', provider: 'openai' },
  { id: 'onyx', name: 'Onyx (Deep)', provider: 'openai' },
  { id: 'nova', name: 'Nova (Bright)', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer (Gentle)', provider: 'openai' }
];

interface VoiceConfigurationProps {
  config: any;
  businessContext: {
    businessName: string;
    industry: string;
    description: string;
  };
  onUpdate: (config: any) => void;
}

export default function VoiceConfiguration({ config, businessContext, onUpdate }: VoiceConfigurationProps) {
  const [localConfig, setLocalConfig] = useState({
    voiceId: config.voiceId || 'alloy',
    language: config.language || 'en',
    firstMessage: config.firstMessage || '',
    systemPrompt: config.systemPrompt || '',
    voiceSpeed: config.voiceSpeed || 1.0,
    voiceTemperature: config.voiceTemperature || 0.7
  });

  const [previewLoading, setPreviewLoading] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onUpdate(updated);
  };

  const generateSystemPrompt = () => {
    const prompt = ToolGenerator.generateSystemPrompt({
      businessName: businessContext.businessName,
      businessType: businessContext.industry,
      businessDescription: businessContext.description,
      industry: businessContext.industry,
      description: businessContext.description
    });
    handleFieldChange('systemPrompt', prompt);
  };

  const generateFirstMessage = () => {
    const message = ToolGenerator.generateFirstMessage({
      businessName: businessContext.businessName,
      businessType: businessContext.industry,
      businessDescription: businessContext.description,
      industry: businessContext.industry,
      description: businessContext.description
    });
    handleFieldChange('firstMessage', message);
  };

  const previewVoice = async () => {
    setPreviewLoading(true);
    // In a real implementation, this would play a sample of the selected voice
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPreviewLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Selection
          </CardTitle>
          <CardDescription>
            Choose a voice and personality for your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select
              value={localConfig.voiceId}
              onValueChange={(value) => handleFieldChange('voiceId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previewVoice}
              disabled={previewLoading}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {previewLoading ? 'Loading...' : 'Preview Voice'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="speed">Voice Speed</Label>
              <Input
                id="speed"
                type="number"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localConfig.voiceSpeed}
                onChange={(e) => handleFieldChange('voiceSpeed', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Voice Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={localConfig.voiceTemperature}
                onChange={(e) => handleFieldChange('voiceTemperature', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Agent Personality
          </CardTitle>
          <CardDescription>
            Define how your agent greets callers and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstMessage">First Message (Greeting)</Label>
            <div className="flex gap-2">
              <Textarea
                id="firstMessage"
                placeholder="e.g., Thank you for calling [Business Name]. How may I assist you today?"
                value={localConfig.firstMessage}
                onChange={(e) => handleFieldChange('firstMessage', e.target.value)}
                rows={2}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={generateFirstMessage}
                disabled={!businessContext.businessName}
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt (Personality)</Label>
            <div className="flex gap-2">
              <Textarea
                id="systemPrompt"
                placeholder="Define the agent's personality, knowledge, and behavior..."
                value={localConfig.systemPrompt}
                onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
                rows={6}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={generateSystemPrompt}
                disabled={!businessContext.businessName}
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              This defines your agent's personality, knowledge, and how it should respond to customers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}