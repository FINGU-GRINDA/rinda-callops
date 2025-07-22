'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Room, RoomEvent, Track, createLocalTracks } from 'livekit-client';

interface WebCallTestProps {
  agentId: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface TestCallData {
  call_id: string;
  room_name: string;
  access_token: string;
  websocket_url: string;
  agent: {
    id: string;
    name: string;
    voice: string;
  };
}

export default function WebCallTest({ agentId }: WebCallTestProps) {
  const { getIdToken } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callData, setCallData] = useState<TestCallData | null>(null);
  const [callStatus, setCallStatus] = useState('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<any>(null);
  const localTrackRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if (localTrackRef.current) {
        localTrackRef.current.stop();
      }
    };
  }, []);

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const startCall = async () => {
    setIsConnecting(true);
    setCallStatus('connecting');
    addMessage('system', 'Connecting to agent...');

    try {
      const token = await getIdToken();
      
      // Create test call via our API
      const response = await fetch(`/api/test/web-call/create/${agentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create test call');
      }

      const data: TestCallData = await response.json();
      setCallData(data);

      // Create and connect to LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      
      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          document.body.appendChild(audioElement);
          addMessage('system', 'Agent audio connected');
        }
      });

      room.on(RoomEvent.Connected, () => {
        addMessage('system', `Connected to ${data.agent.name}`);
        setIsCallActive(true);
        setCallStatus('connected');
        toast.success('Connected to agent!');
      });

      room.on(RoomEvent.Disconnected, () => {
        addMessage('system', 'Disconnected from room');
        setIsCallActive(false);
        setCallStatus('idle');
      });

      // Connect to the room
      await room.connect(data.websocket_url, data.access_token);

      // Create and publish local audio track
      const tracks = await createLocalTracks({
        audio: true,
        video: false,
      });

      for (const track of tracks) {
        if (track.kind === Track.Kind.Audio) {
          localTrackRef.current = track;
          await room.localParticipant.publishTrack(track);
          addMessage('system', 'Microphone connected');
        }
      }

    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('idle');
      addMessage('system', `Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to start call');
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    if (!callData) return;

    try {
      const token = await getIdToken();
      
      // End the test call
      await fetch(`/api/test/web-call/${callData.call_id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Cleanup local state
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (localTrackRef.current) {
        localTrackRef.current.stop();
        localTrackRef.current = null;
      }

      setIsCallActive(false);
      setCallStatus('idle');
      setIsMuted(false);
      setCallData(null);
      addMessage('system', 'Call ended');
      
      toast.success('Call ended');

    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Error ending call');
    }
  };

  const toggleMute = async () => {
    if (localTrackRef.current && roomRef.current) {
      const newMutedState = !isMuted;
      
      if (newMutedState) {
        // Mute by stopping the track
        await localTrackRef.current.mute();
      } else {
        // Unmute by restarting the track
        await localTrackRef.current.unmute();
      }
      
      setIsMuted(newMutedState);
      addMessage('system', newMutedState ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      default:
        return 'Ready to test';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Web Call Test
        </CardTitle>
        <CardDescription className="text-white/70">
          Test your agent directly in the browser using your microphone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Call Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isCallActive ? 'animate-pulse' : ''}`} />
            <span className="font-medium">{getStatusText()}</span>
            {callData && (
              <Badge variant="outline" className="text-xs">
                {callData.agent.name}
              </Badge>
            )}
          </div>
          
          {isCallActive && (
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-100 w-1/2" />
              </div>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex gap-3">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start Test Call
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="secondary"
                className="flex-1"
              >
                {isMuted ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Mute
                  </>
                )}
              </Button>
              <Button
                onClick={endCall}
                variant="destructive"
                className="flex-1"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            </>
          )}
        </div>

        {/* Conversation Transcript */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/70">Conversation</h4>
          <ScrollArea className="h-[300px] w-full rounded-lg bg-white/5 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversation yet.</p>
                <p className="text-xs mt-1">Start a test call to begin talking with your agent.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={message.role === 'user' ? 'default' : message.role === 'assistant' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {message.role}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/90 ml-2">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Web Test Call</p>
              <p className="text-xs opacity-90">
                This creates a test session where you can speak with your agent using your browser's microphone. 
                Perfect for testing before going live with real phone calls.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}