'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestAgentProps {
  agentData: any;
  tools: any[];
}

export default function TestAgent({ agentData, tools }: TestAgentProps) {
  const [calling, setCalling] = useState(false);
  const [muted, setMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [callId, setCallId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTestCall = async () => {
    if (!testPhoneNumber) {
      setError('Please enter a phone number to call');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create a test call using the API
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          assistantId: agentData.assistantId,
          customer: {
            number: testPhoneNumber,
            name: 'Test Caller'
          },
          phoneNumberId: agentData.phoneNumberId,
          type: 'webCall' // Use webCall for browser-based testing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start test call');
      }

      const call = await response.json();
      setCallId(call.id);
      setCalling(true);
      setTranscript([
        { role: 'assistant', text: agentData.settings?.firstMessage || 'Hello, how can I help you?' }
      ]);
      
      // Start tracking call duration
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Poll for call updates
      pollCallStatus(call.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start call');
    } finally {
      setLoading(false);
    }
  };

  const pollCallStatus = async (callId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/calls/${callId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch call status');
        }

        const call = await response.json();
        
        // Update transcript if available
        if (call.messages && call.messages.length > 0) {
          const newTranscript = call.messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            text: msg.content
          }));
          setTranscript(newTranscript);
        }

        // Check if call has ended
        if (call.status === 'ended' || call.endedAt) {
          clearInterval(pollInterval);
          endTestCall();
        }
      } catch (err) {
        console.error('Error polling call status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Store interval for cleanup
    (window as any).pollInterval = pollInterval;
  };

  const endTestCall = async () => {
    if (callId) {
      try {
        // End the call via API
        await fetch(`/api/calls/${callId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      } catch (err) {
        console.error('Error ending call:', err);
      }
    }

    setCalling(false);
    setCallDuration(0);
    setCallId(null);
    
    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if ((window as any).pollInterval) {
      clearInterval((window as any).pollInterval);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    // TODO: Implement actual mute functionality
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if ((window as any).pollInterval) {
        clearInterval((window as any).pollInterval);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Test Your Agent
          </CardTitle>
          <CardDescription>
            Make a test call to experience how your AI agent will interact with customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {!calling ? (
              <>
                <Phone className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Ready to Test</h3>
                <p className="text-gray-600 mb-4">
                  Enter your phone number to receive a test call from your AI agent
                </p>
                
                <div className="max-w-sm mx-auto mb-4">
                  <Label htmlFor="testPhone" className="text-left block mb-2">
                    Your Phone Number
                  </Label>
                  <Input
                    id="testPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="mb-2"
                  />
                  {error && (
                    <p className="text-sm text-red-600 mb-2">{error}</p>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={startTestCall}
                  disabled={loading || !agentData.assistantId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {loading ? 'Starting Call...' : 'Start Test Call'}
                </Button>
                
                {!agentData.assistantId && (
                  <p className="text-sm text-amber-600 mt-2">
                    Please save your agent first before testing
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Volume2 className="w-8 h-8 text-blue-600 animate-pulse" />
                  <div>
                    <p className="text-2xl font-bold">{formatDuration(callDuration)}</p>
                    <p className="text-sm text-gray-600">Call in progress</p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center mb-6">
                  <Button
                    variant={muted ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleMute}
                  >
                    {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={endTestCall}
                  >
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Call
                  </Button>
                </div>

                <div className="text-left bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">Conversation:</p>
                  {transcript.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                        {msg.role}
                      </Badge>
                      <p className="text-sm mt-1">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Test Scenarios:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Try asking about your business hours</p>
              <p>✓ Test booking an appointment or making a reservation</p>
              <p>✓ Ask about services or products you offer</p>
              <p>✓ Test how the agent handles common customer questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Agent Name</p>
            <p className="font-medium">{agentData.name || 'Not set'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Business</p>
            <p className="font-medium">{agentData.businessName || 'Not set'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Voice</p>
            <p className="font-medium">
              {agentData.settings?.voiceId ? 
                `${agentData.settings.voiceId} (Speed: ${agentData.settings.voiceSpeed}x)` : 
                'Not set'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Tools Configured</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {tools.length > 0 ? (
                tools.map((tool, index) => (
                  <Badge key={index} variant="outline">
                    {tool.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tools configured</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}