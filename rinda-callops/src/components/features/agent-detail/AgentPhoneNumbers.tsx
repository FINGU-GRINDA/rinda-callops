'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Trash2, Link2, ExternalLink, Import, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PhoneNumber {
  id: string;
  number?: string;
  phoneNumber?: string;
  name?: string;
  provider: string;
  status: string;
  assignedAgentId?: string;
  assistantId?: string;
}

interface AgentPhoneNumbersProps {
  agent: any;
  onUpdate: (data: any) => void;
}

export default function AgentPhoneNumbers({ agent, onUpdate }: AgentPhoneNumbersProps) {
  const { makeAuthenticatedRequest } = useAuthenticatedApi();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState<PhoneNumber | null>(null);
  
  // Twilio import state
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  const [importingTwilio, setImportingTwilio] = useState(false);

  useEffect(() => {
    fetchPhoneNumbers();
    if (agent.phoneNumberId) {
      fetchCurrentPhoneNumber();
    }
  }, [agent.phoneNumberId]);

  const fetchPhoneNumbers = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/phone-numbers');
      if (!response.ok) throw new Error('Failed to fetch phone numbers');
      
      const data = await response.json();
      setPhoneNumbers(data.phoneNumbers || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPhoneNumber = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/phone-numbers/${agent.phoneNumberId}`);
      if (!response.ok) throw new Error('Failed to fetch phone number details');
      
      const data = await response.json();
      setCurrentPhoneNumber(data);
    } catch (error) {
      console.error('Error fetching current phone number:', error);
    }
  };

  const linkPhoneNumber = async () => {
    if (!selectedPhoneId) return;

    setLinking(true);
    try {
      // Update agent with phone number
      const response = await makeAuthenticatedRequest(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId: selectedPhoneId })
      });

      if (!response.ok) throw new Error('Failed to link phone number');

      // Update phone number with assistant ID
      const phoneResponse = await makeAuthenticatedRequest(`/api/phone-numbers/${selectedPhoneId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: agent.assistantId })
      });

      if (!phoneResponse.ok) throw new Error('Failed to update phone number');

      onUpdate({ phoneNumberId: selectedPhoneId });
      fetchCurrentPhoneNumber();
      alert('Phone number linked successfully!');
    } catch (error) {
      console.error('Error linking phone number:', error);
      alert('Failed to link phone number. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const unlinkPhoneNumber = async () => {
    if (!confirm('Are you sure you want to unlink this phone number?')) return;

    setLinking(true);
    try {
      // Unlink phone number
      if (agent.phoneNumberId) {
        const phoneResponse = await makeAuthenticatedRequest(`/api/phone-numbers/${agent.phoneNumberId}/link`, {
          method: 'DELETE'
        });
        
        if (!phoneResponse.ok) throw new Error('Failed to unlink phone number');
      }

      // Update agent
      const response = await makeAuthenticatedRequest(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId: null })
      });

      if (!response.ok) throw new Error('Failed to unlink phone number');

      onUpdate({ phoneNumberId: null });
      setCurrentPhoneNumber(null);
      alert('Phone number unlinked successfully!');
    } catch (error) {
      console.error('Error unlinking phone number:', error);
      alert('Failed to unlink phone number. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const importTwilioNumber = async () => {
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      alert('Please fill in all Twilio fields');
      return;
    }

    setImportingTwilio(true);
    try {
      const response = await makeAuthenticatedRequest('/api/phone-numbers/import-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twilioAccountSid,
          twilioAuthToken,
          twilioPhoneNumber,
          name: `Twilio - ${twilioPhoneNumber}`
        })
      });

      if (!response.ok) throw new Error('Failed to import Twilio number');

      alert('Twilio number imported successfully!');
      fetchPhoneNumbers();
      setTwilioAccountSid('');
      setTwilioAuthToken('');
      setTwilioPhoneNumber('');
    } catch (error) {
      console.error('Error importing Twilio number:', error);
      alert('Failed to import Twilio number. Please check your credentials.');
    } finally {
      setImportingTwilio(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Phone Number */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Current Phone Number
          </CardTitle>
          <CardDescription className="text-white/70">
            Phone number linked to this agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPhoneNumber ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-semibold text-lg">{currentPhoneNumber.phoneNumber || currentPhoneNumber.number}</p>
                  <p className="text-white/70 text-sm">{currentPhoneNumber.name || 'No name'}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-white/20">
                      {currentPhoneNumber.provider}
                    </Badge>
                    <Badge variant={currentPhoneNumber.status === 'active' ? 'default' : 'secondary'}>
                      {currentPhoneNumber.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={unlinkPhoneNumber}
                  disabled={linking}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Unlink
                </Button>
              </div>

              <div className="text-sm text-white/70 space-y-1">
                <p>✓ Customers can call this number to reach your AI agent</p>
                <p>✓ Agent can make outbound calls from this number</p>
                <p>✓ All calls will be logged and tracked</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/70 mb-4">No phone number linked yet</p>
              <p className="text-white/50 text-sm">Link a phone number to enable voice calls</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Management */}
      {!currentPhoneNumber && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle>Phone Number Management</CardTitle>
            <CardDescription className="text-white/70">
              Add or select a phone number for this agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="available" className="space-y-4">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="available" className="data-[state=active]:bg-white/20">
                  Available Numbers
                </TabsTrigger>
                <TabsTrigger value="provider" className="data-[state=active]:bg-white/20">
                  Get from Provider
                </TabsTrigger>
                <TabsTrigger value="twilio" className="data-[state=active]:bg-white/20">
                  Import Twilio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-white/70 text-sm">Select from your existing phone numbers</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchPhoneNumbers}
                    className="text-white hover:bg-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {loading ? (
                  <p>Loading phone numbers...</p>
                ) : phoneNumbers.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {phoneNumbers.filter(p => !p.assignedAgentId || p.assignedAgentId === agent.id).map((phone) => (
                        <label
                          key={phone.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="phoneNumber"
                            value={phone.id}
                            checked={selectedPhoneId === phone.id}
                            onChange={(e) => setSelectedPhoneId(e.target.value)}
                            className="text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{phone.phoneNumber || phone.number}</p>
                            {phone.name && (
                              <p className="text-white/70 text-sm">{phone.name}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-white/20">
                            {phone.provider}
                          </Badge>
                        </label>
                      ))}
                    </div>

                    <Button
                      onClick={linkPhoneNumber}
                      disabled={!selectedPhoneId || linking}
                      className="w-full"
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      {linking ? 'Linking...' : 'Link Selected Number'}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/70">No phone numbers available</p>
                    <p className="text-white/50 text-sm mt-2">Get a new number from provider or import from Twilio</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="provider" className="space-y-4">
                <p className="text-white/70">
                  Purchase new phone numbers from voice providers
                </p>
                
                <div className="text-sm text-white/60 space-y-1">
                  <p>• Purchase phone numbers in 50+ countries</p>
                  <p>• Local and toll-free numbers available</p>
                  <p>• Instant provisioning</p>
                  <p>• Starting at $1/month</p>
                </div>
              </TabsContent>

              <TabsContent value="twilio" className="space-y-4">
                <p className="text-white/70">
                  Import your existing Twilio phone numbers
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="twilioSid" className="text-white">Twilio Account SID</Label>
                    <Input
                      id="twilioSid"
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twilioAuth" className="text-white">Twilio Auth Token</Label>
                    <Input
                      id="twilioAuth"
                      type="password"
                      placeholder="Your Twilio auth token"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twilioPhone" className="text-white">Phone Number</Label>
                    <Input
                      id="twilioPhone"
                      type="tel"
                      placeholder="+1234567890"
                      value={twilioPhoneNumber}
                      onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-white/50 text-xs mt-1">E.164 format (e.g., +1234567890)</p>
                  </div>

                  <Button
                    onClick={importTwilioNumber}
                    disabled={importingTwilio}
                    className="w-full"
                  >
                    <Import className="mr-2 h-4 w-4" />
                    {importingTwilio ? 'Importing...' : 'Import Twilio Number'}
                  </Button>
                </div>

                <div className="text-sm text-white/60 space-y-1">
                  <p>• Keep your existing phone numbers</p>
                  <p>• No porting required</p>
                  <p>• Works with Twilio Voice</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}