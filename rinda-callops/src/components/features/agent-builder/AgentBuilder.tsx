'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { businessTemplates } from '@/lib/constants/business-templates';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Bot, 
  Mic, 
  Settings, 
  Phone,
  TestTube,
  Play,
  Pause,
  Volume2,
  Check,
  Star,
  Zap,
  Users,
  Calendar,
  MessageSquare,
  Workflow,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

// Import the new modular components
import { AgentData, BusinessData, Tool, VoiceOption } from './types';
import BusinessDataForm from './components/BusinessDataForm';

interface EnhancedAgentBuilderProps {
  onSwitchToFlow?: () => void;
}

export default function EnhancedAgentBuilder({ onSwitchToFlow }: EnhancedAgentBuilderProps) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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
  const [generatedTools, setGeneratedTools] = useState<Tool[]>([]);
  const [testingVoice, setTestingVoice] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>({});

  const steps = [
    { id: 'business', title: 'Business Setup', icon: <Users className="w-5 h-5" /> },
    { id: 'personality', title: 'AI Personality', icon: <Bot className="w-5 h-5" /> },
    { id: 'voice', title: 'Voice & Speech', icon: <Mic className="w-5 h-5" /> },
    { id: 'tools', title: 'Business Data', icon: <Zap className="w-5 h-5" /> },
    { id: 'test', title: 'Test & Deploy', icon: <TestTube className="w-5 h-5" /> }
  ];

  const voiceOptions: VoiceOption[] = [
    { id: 'ash', name: 'Ash', description: 'Deep, masculine voice', accent: 'American' },
    { id: 'ballad', name: 'Ballad', description: 'British professional voice', accent: 'British' },
    { id: 'coral', name: 'Coral', description: 'Warm, feminine voice', accent: 'American' },
    { id: 'sage', name: 'Sage', description: 'Wise, professional voice', accent: 'American' },
    { id: 'verse', name: 'Verse', description: 'Melodic, feminine voice', accent: 'American' },
  ];

  const applyTemplate = (templateId: string) => {
    const template = businessTemplates.find(t => t.id === templateId);
    if (template) {
      setAgentData(prev => ({
        ...prev,
        business_type: templateId,
        instructions: template.system_prompt_template.replace('{businessName}', prev.business_name || '[Your Business Name]'),
        first_message: template.greeting_template.replace('{businessName}', prev.business_name || '[Your Business Name]')
      }));
    }
  };

  useEffect(() => {
    if (agentData.business_name && agentData.business_description) {
      generateAIContent();
    }
  }, [agentData.business_name, agentData.business_description, agentData.business_type]);

  const generateAIContent = async () => {
    setGenerating(true);
    try {
      // Generate AI-powered content
      setTimeout(() => {
        const businessType = agentData.business_type;
        // Update prompts with business name
        if (agentData.business_name) {
          const template = businessTemplates.find(t => t.id === businessType);
          if (template) {
            setAgentData(prev => ({
              ...prev,
              instructions: template.system_prompt_template.replace('{businessName}', agentData.business_name),
              first_message: template.greeting_template.replace('{businessName}', agentData.business_name)
            }));
          }
        }
        setGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating content:', error);
      setGenerating(false);
    }
  };

  const previewTools = async () => {
    setGenerating(true);
    try {
      const token = await getIdToken();
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
      
      const response = await fetch(`/api/tools/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData: {
            name: agentData.business_name,
            type: agentData.business_type,
            description: agentData.business_description,
            requirements: agentData.custom_requirements || ''
          },
          toolConfiguration: businessData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedTools(result.tools || []);
      } else {
        console.error('Failed to generate tools preview');
        setGeneratedTools([]);
      }
    } catch (error) {
      console.error('Error generating tools preview:', error);
      setGeneratedTools([]);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAgent = async () => {
    setSaving(true);
    try {
      const token = await getIdToken();
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
      
      // First, generate smart tools using the new simplified API
      const toolsResponse = await fetch(`/api/tools/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessData: {
            name: agentData.business_name,
            type: agentData.business_type,
            description: agentData.business_description,
            requirements: agentData.custom_requirements || ''
          },
          toolConfiguration: businessData
        }),
      });

      let tools = [];
      if (toolsResponse.ok) {
        const toolsResult = await toolsResponse.json();
        tools = toolsResult.tools || [];
      }

      // Prepare the data to send with generated tools
      const agentPayload = {
        ...agentData,
        business_data: businessData,
        tools: tools
      };
      
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agentPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to save agent');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testVoice = () => {
    setTestingVoice(true);
    // Simulate voice testing
    setTimeout(() => setTestingVoice(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Ambient Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            {/* View Mode Toggle */}
            {onSwitchToFlow && (
              <div className="flex gap-1 bg-slate-800/90 backdrop-blur-xl p-1 rounded-lg border border-gray-700">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onSwitchToFlow}
                  className="text-white hover:bg-white/10"
                >
                  <Workflow className="w-4 h-4 mr-2" />
                  Visual Builder
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Classic Form
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create Your AI Agent
            </h1>
            <p className="text-white/70 text-lg">Build a smart assistant for your business in minutes</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    index < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-4xl mx-auto mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center">
                <p className={`text-sm font-medium ${index <= currentStep ? 'text-white' : 'text-white/60'}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={steps[currentStep].id} className="space-y-8">
            {/* Business Setup */}
            <TabsContent value="business" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Business Setup</h2>
                  <p className="text-white/70">Tell us about your business</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">Agent Name</Label>
                      <Input
                        value={agentData.name}
                        onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                        placeholder="e.g., Customer Service AI"
                        className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Business Name</Label>
                      <Input
                        value={agentData.business_name}
                        onChange={(e) => {
                          const newBusinessName = e.target.value;
                          setAgentData(prev => ({
                            ...prev,
                            business_name: newBusinessName,
                            first_message: prev.first_message?.replace(/{businessName}/g, newBusinessName) || prev.first_message
                          }));
                        }}
                        placeholder="e.g., Ahmed's Pizza"
                        className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Business Type</Label>
                    <Select
                      value={agentData.business_type}
                      onValueChange={(value) => applyTemplate(value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-gray-700/50 text-white focus:border-blue-400">
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

                  {agentData.business_type && (
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                      <h4 className="text-white font-medium mb-2">Template Preview</h4>
                      <div className="text-sm text-white/70">
                        {businessTemplates.find(t => t.id === agentData.business_type)?.description}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Business Description</Label>
                    <Textarea
                      value={agentData.business_description}
                      onChange={(e) => setAgentData({ ...agentData, business_description: e.target.value })}
                      placeholder="Tell us about your business, services, and what makes you unique..."
                      rows={4}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">What should your AI agent do?</Label>
                    <Textarea
                      value={agentData.custom_requirements}
                      onChange={(e) => setAgentData({ ...agentData, custom_requirements: e.target.value })}
                      placeholder="e.g., Book appointments, Answer questions about services, Handle customer support..."
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => setCurrentStep(1)} 
                    disabled={!agentData.business_name || !agentData.business_description}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {generating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating AI Content...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* AI Personality */}
            <TabsContent value="personality" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">AI Personality</h2>
                  <p className="text-white/70">Customize how your AI communicates</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">System Prompt</Label>
                    <Textarea
                      value={agentData.instructions}
                      onChange={(e) => setAgentData({ ...agentData, instructions: e.target.value })}
                      placeholder="How should your AI behave and respond to customers?"
                      rows={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">First Message</Label>
                    <Textarea
                      value={agentData.first_message}
                      onChange={(e) => setAgentData({ ...agentData, first_message: e.target.value })}
                      placeholder="What should your AI say when someone calls?"
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setCurrentStep(0)} className="text-white hover:bg-white/10">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Continue
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Voice & Speech */}
            <TabsContent value="voice" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Voice & Speech</h2>
                  <p className="text-white/70">Choose your AI's voice</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Voice Selection</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {voiceOptions.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            agentData.voice === voice.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                          onClick={() => setAgentData({ ...agentData, voice: voice.id })}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{voice.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                testVoice();
                              }}
                              className="text-white hover:bg-white/10"
                            >
                              {testingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-white/70 text-sm mb-1">{voice.description}</p>
                          <p className="text-white/50 text-xs">{voice.accent} accent</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Language</Label>
                    <Select
                      value={agentData.language}
                      onValueChange={(value) => setAgentData({ ...agentData, language: value })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-gray-700/50 text-white focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-white hover:bg-white/10">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Continue
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Business Data & Tools */}
            <TabsContent value="tools" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Business Information</h2>
                  <p className="text-white/70">Help us create smart tools for your business</p>
                </div>

                {/* Use the new modular BusinessDataForm component */}
                <BusinessDataForm 
                  businessType={agentData.business_type}
                  businessData={businessData}
                  setBusinessData={setBusinessData}
                />

                {/* Preview generated tools */}
                <div className="mt-6">
                  <Button
                    onClick={previewTools}
                    disabled={generating}
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Business Data...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Smart AI Tools
                      </>
                    )}
                  </Button>
                  
                  {generatedTools.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                      <h4 className="text-white font-medium mb-3">Your AI will be able to:</h4>
                      <div className="space-y-2">
                        {generatedTools.map((tool, index) => (
                          <div key={index} className="flex items-center gap-3 text-white/70 text-sm">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span>{tool.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)} className="text-white hover:bg-white/10">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Continue
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Test & Deploy */}
            <TabsContent value="test" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <TestTube className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to Deploy</h2>
                  <p className="text-white/70">Your AI agent is ready to help your customers</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 mb-8 border border-gray-700/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">Agent Summary</h4>
                      <ul className="space-y-1 text-white/70 text-sm">
                        <li>Name: {agentData.name}</li>
                        <li>Business: {agentData.business_name}</li>
                        <li>Type: {businessTemplates.find(t => t.id === agentData.business_type)?.name}</li>
                        <li>Voice: {voiceOptions.find(v => v.id === agentData.voice)?.name}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Capabilities</h4>
                      <ul className="space-y-1 text-white/70 text-sm">
                        {generatedTools.slice(0, 4).map((tool, index) => (
                          <li key={index}>• {tool.name.replace(/_/g, ' ')}</li>
                        ))}
                        {generatedTools.length > 4 && (
                          <li>• And {generatedTools.length - 4} more...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(3)} className="text-white hover:bg-white/10">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSaveAgent} 
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Settings className="w-4 h-4 mr-2 animate-spin" />
                        Creating Agent...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}