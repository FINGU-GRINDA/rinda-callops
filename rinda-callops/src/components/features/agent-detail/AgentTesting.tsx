'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Globe, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import WebCallTest from './WebCallTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentTestingProps {
  agent: any;
}

export default function AgentTesting({ agent }: AgentTestingProps) {
  const { makeAuthenticatedRequest } = useAuthenticatedApi();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startPhoneCall = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    // Clean up phone number to E.164 format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      // Assume US number if no country code
      if (formattedPhone.length === 10) {
        formattedPhone = '+1' + formattedPhone;
      } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await makeAuthenticatedRequest('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          phone_number: formattedPhone,
          customer_name: 'Test Call',
          type: 'phone'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start call');
      }

      const call = await response.json();
      alert(`Call started! Call ID: ${call.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Agent Status */}
      <Card className="bg-green-500/10 backdrop-blur-md border-green-500/20 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-500">Active</Badge>
            <p className="text-sm">LiveKit Agent: {agent.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Methods */}
      <Tabs defaultValue="phone" className="space-y-6">
        <TabsList className="bg-slate-800/50 backdrop-blur-xl border-gray-700/50">
          <TabsTrigger value="phone" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-white/70">
            <Phone className="mr-2 h-4 w-4" />
            Phone Test
          </TabsTrigger>
          <TabsTrigger value="web" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-white/70">
            <Globe className="mr-2 h-4 w-4" />
            Web Test
          </TabsTrigger>
        </TabsList>

        {/* Phone Call Test */}
        <TabsContent value="phone">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Call Test
              </CardTitle>
              <CardDescription className="text-white/70">
                Test your agent with a real phone call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-800/50 border-gray-700/50 text-white placeholder:text-white/40 focus:border-blue-400"
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <Button
                onClick={startPhoneCall}
                disabled={loading}
                className="w-full"
              >
                <Phone className="mr-2 h-4 w-4" />
                {loading ? 'Starting Call...' : 'Start Test Call'}
              </Button>

              <div className="text-sm text-white/60 space-y-1">
                <p>• Call will be made from your linked phone number</p>
                <p>• Standard calling rates may apply</p>
                <p>• Call will be recorded for analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Web Call Test */}
        <TabsContent value="web">
          <WebCallTest agentId={agent.id} />
        </TabsContent>
      </Tabs>

      {/* Test Scenarios */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test Scenarios
          </CardTitle>
          <CardDescription className="text-white/70">
            Suggested test conversations for your {agent.business_type} agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTestScenarios(agent.business_type).map((scenario, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">{scenario.title}</h4>
                <p className="text-white/70 text-sm">{scenario.prompt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTestScenarios(businessType: string) {
  const scenarios: Record<string, Array<{ title: string; prompt: string }>> = {
    restaurant: [
      {
        title: 'Make a Reservation',
        prompt: 'Hi, I would like to make a reservation for 4 people tonight at 7 PM'
      },
      {
        title: 'Check Hours',
        prompt: 'What time do you close on Saturday?'
      },
      {
        title: 'Menu Inquiry',
        prompt: 'Do you have any vegetarian options?'
      }
    ],
    salon: [
      {
        title: 'Book Appointment',
        prompt: 'I need a haircut appointment for tomorrow afternoon'
      },
      {
        title: 'Service Inquiry',
        prompt: 'How much does a full color treatment cost?'
      },
      {
        title: 'Availability Check',
        prompt: 'Do you have any openings this weekend?'
      }
    ],
    medical: [
      {
        title: 'Schedule Appointment',
        prompt: 'I need to schedule a check-up with Dr. Smith'
      },
      {
        title: 'Office Hours',
        prompt: 'What are your hours on Monday?'
      },
      {
        title: 'Emergency Inquiry',
        prompt: 'Do you handle emergency appointments?'
      }
    ],
    retail: [
      {
        title: 'Product Availability',
        prompt: 'Do you have the iPhone 15 Pro in stock?'
      },
      {
        title: 'Store Hours',
        prompt: 'What time do you open tomorrow?'
      },
      {
        title: 'Return Policy',
        prompt: 'What is your return policy?'
      }
    ],
    'real-estate': [
      {
        title: 'Property Viewing',
        prompt: 'I would like to schedule a viewing for the property on Main Street'
      },
      {
        title: 'Property Information',
        prompt: 'Can you tell me about available 3-bedroom homes?'
      },
      {
        title: 'Agent Availability',
        prompt: 'Is an agent available to show properties this weekend?'
      }
    ],
    default: [
      {
        title: 'General Inquiry',
        prompt: 'Can you tell me about your services?'
      },
      {
        title: 'Hours of Operation',
        prompt: 'What are your business hours?'
      },
      {
        title: 'Contact Information',
        prompt: 'How can I reach someone from your team?'
      }
    ]
  };

  return scenarios[businessType] || scenarios.default;
}