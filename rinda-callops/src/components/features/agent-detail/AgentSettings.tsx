'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

interface AgentSettingsProps {
  agent: any;
  onUpdate: (data: any) => void;
}

export default function AgentSettings({ agent, onUpdate }: AgentSettingsProps) {
  const { makeAuthenticatedRequest } = useAuthenticatedApi();
  const [settings, setSettings] = useState({
    name: agent.name || '',
    business_name: agent.business_name || '',
    first_message: agent.first_message || '',
    instructions: agent.instructions || '',
    voice: agent.voice || 'alloy',
    language: agent.language || 'en-US'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await makeAuthenticatedRequest(`/api/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          business_name: settings.business_name,
          first_message: settings.first_message,
          instructions: settings.instructions,
          voice: settings.voice,
          language: settings.language
        })
      });

      if (!response.ok) throw new Error('Failed to update settings');

      onUpdate({
        name: settings.name,
        business_name: settings.business_name,
        first_message: settings.first_message,
        instructions: settings.instructions,
        voice: settings.voice,
        language: settings.language
      });
      
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Settings
          </CardTitle>
          <CardDescription className="text-white/70">
            Configure your agent's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Agent Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="business_name" className="text-white">Business Name</Label>
            <Input
              id="business_name"
              value={settings.business_name}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="first_message" className="text-white">First Message</Label>
            <Textarea
              id="first_message"
              value={settings.first_message}
              onChange={(e) => setSettings({ ...settings, first_message: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              rows={3}
              placeholder="Hello! Thank you for calling..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Voice Settings</CardTitle>
          <CardDescription className="text-white/70">
            Configure how your agent sounds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="voice" className="text-white">Voice</Label>
            <Select
              value={settings.voice}
              onValueChange={(value) => setSettings({ ...settings, voice: value })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy (Balanced)</SelectItem>
                <SelectItem value="echo">Echo (Expressive)</SelectItem>
                <SelectItem value="fable">Fable (Energetic)</SelectItem>
                <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                <SelectItem value="nova">Nova (Bright)</SelectItem>
                <SelectItem value="shimmer">Shimmer (Gentle)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language" className="text-white">Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => setSettings({ ...settings, language: value })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
                <SelectItem value="ko-KR">Korean</SelectItem>
                <SelectItem value="ja-JP">Japanese</SelectItem>
                <SelectItem value="zh-CN">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription className="text-white/70">
            Configure your agent's instructions and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instructions" className="text-white">Agent Instructions</Label>
            <Textarea
              id="instructions"
              value={settings.instructions}
              onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              rows={5}
              placeholder="You are a helpful AI assistant for [business name]. You should be professional, friendly, and knowledgeable about..."
            />
            <p className="text-white/50 text-xs mt-1">Define how your agent should behave and what information it knows about your business.</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}