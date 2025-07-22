'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, Sparkles } from 'lucide-react';

const industries = [
  { value: 'restaurant', label: 'Restaurant & Food Service' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'salon', label: 'Salon & Beauty' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'automotive', label: 'Automotive Services' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'other', label: 'Other' }
];

const businessTemplates = {
  restaurant: {
    description: "AI assistant for taking orders, reservations, and answering questions about menu and hours",
    services: ["Take phone orders", "Make reservations", "Answer menu questions", "Provide hours and location"]
  },
  medical: {
    description: "Medical receptionist for scheduling appointments, handling patient inquiries, and managing prescriptions",
    services: ["Schedule appointments", "Check doctor availability", "Answer insurance questions", "Handle prescription refills"]
  },
  salon: {
    description: "Salon assistant for booking appointments, answering service questions, and managing schedules",
    services: ["Book appointments", "Check stylist availability", "Answer service questions", "Reschedule appointments"]
  }
};

interface BusinessSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function BusinessSetup({ data, onUpdate }: BusinessSetupProps) {
  const [localData, setLocalData] = useState({
    name: data.name || '',
    businessName: data.businessName || '',
    industry: data.industry || '',
    description: data.description || '',
    services: data.services || []
  });

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  const applyTemplate = () => {
    if (localData.industry && businessTemplates[localData.industry as keyof typeof businessTemplates]) {
      const template = businessTemplates[localData.industry as keyof typeof businessTemplates];
      const updated = {
        ...localData,
        description: template.description,
        services: template.services
      };
      setLocalData(updated);
      onUpdate(updated);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about your business to create a personalized AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Agent Name</Label>
              <Input
                id="agentName"
                placeholder="e.g., Sarah - Front Desk Assistant"
                value={localData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="e.g., Joe's Pizza Palace"
                value={localData.businessName}
                onChange={(e) => handleFieldChange('businessName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={localData.industry}
              onValueChange={(value) => handleFieldChange('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {localData.industry && businessTemplates[localData.industry as keyof typeof businessTemplates] && (
            <Button
              variant="outline"
              size="sm"
              onClick={applyTemplate}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use {industries.find(i => i.value === localData.industry)?.label} Template
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your business and what services you offer..."
              value={localData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
            />
            <p className="text-sm text-gray-500">
              This helps the AI understand your business and provide accurate responses
            </p>
          </div>

          <div className="space-y-2">
            <Label>Services Offered (Optional)</Label>
            <div className="space-y-2">
              {localData.services.map((service: string, index: number) => (
                <Input
                  key={index}
                  value={service}
                  onChange={(e) => {
                    const updated = [...localData.services];
                    updated[index] = e.target.value;
                    handleFieldChange('services', updated);
                  }}
                  placeholder="Service name"
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFieldChange('services', [...localData.services, ''])}
              >
                Add Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}