'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { businessTemplates } from '@/lib/constants/business-templates';
import { Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    phone: '',
    description: '',
    customRequirements: '',
  });

  const handleTemplateSelect = (templateId: string) => {
    setFormData({ ...formData, businessType: templateId });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Create user account and initial agent
    console.log('Onboarding data:', formData);
    router.push('/agents/new');
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center mb-8">
              <Phone className="h-8 w-8 mr-2" />
              <span className="font-bold text-2xl">RINDA CallOps</span>
            </Link>
            <h1 className="text-4xl font-bold mb-4">Choose Your Business Type</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We'll customize your AI phone agent based on your industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Perfect for:
                  </p>
                  <ul className="text-sm space-y-1">
                    {template.exampleQuestions.slice(0, 3).map((question, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span className="text-gray-600 dark:text-gray-400">{question}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Don't see your business type?
            </p>
            <Button variant="outline" onClick={() => handleTemplateSelect('custom')}>
              Create Custom Agent
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center mb-8">
            <Phone className="h-8 w-8 mr-2" />
            <span className="font-bold text-2xl">RINDA CallOps</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Tell Us About Your Business</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            We'll create a custom AI phone agent for your needs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              This helps us customize your AI agent's responses and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Sarah's Salon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@salon.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Business *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="We're a full-service salon offering haircuts, coloring, manicures, and spa treatments. We're open Tuesday-Saturday and have 5 stylists."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customRequirements">What Should Your AI Phone Agent Do?</Label>
                <Textarea
                  id="customRequirements"
                  value={formData.customRequirements}
                  onChange={(e) => setFormData({ ...formData, customRequirements: e.target.value })}
                  placeholder="Book appointments, answer questions about services and prices, check stylist availability, send SMS confirmations"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Create My AI Agent
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}