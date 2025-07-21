import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, PhoneOff, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Room, RoomEvent, Track, createLocalTracks } from 'livekit-client';

interface TestAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: {
    name: string;
    business_name: string;
    first_message: string;
    voice: string;
  };
  agentId?: string;
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

export default function TestAgentModal({ isOpen, onClose, agentData, agentId }: TestAgentModalProps) {
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
    // Cleanup on unmount or modal close
    if (!isOpen) {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
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
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const startCall = async () => {
    if (!agentId) {
      toast.error('Agent ID not available. Please save your agent first.');
      return;
    }

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

      cleanup();
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
        await localTrackRef.current.mute();
      } else {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card 
              className="bg-slate-900 border-gray-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Test Your Agent</h2>
                  <p className="text-gray-400 mt-1">
                    Make a test call to {agentData.business_name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Call Interface */}
              <div className="space-y-6">
                {/* Phone Display - Original Style */}
                <div className="bg-slate-800 rounded-xl p-8 text-center">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white mb-2">
                      {agentData.business_name}
                    </div>
                    <div className="text-lg text-gray-400">
                      {isCallActive ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
                          {callStatus === 'connecting' ? 'Connecting...' : 'Call in progress...'}
                        </div>
                      ) : (
                        'Ready to call'
                      )}
                    </div>
                  </div>

                  {/* Call Controls - Original Style */}
                  <div className="flex items-center justify-center gap-4">
                    {!isCallActive ? (
                      <Button
                        onClick={startCall}
                        disabled={isConnecting}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Phone className="w-5 h-5 mr-2" />
                            Start Call
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <button
                          onClick={toggleMute}
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-none outline-none transition-colors ${
                            isMuted 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {isMuted ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={endCall}
                          className="w-16 h-16 rounded-full flex items-center justify-center border-none outline-none bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Transcript - Only show if there are messages */}
                {messages.length > 0 && (
                  <div className="bg-slate-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Call Transcript</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className="text-gray-300"
                        >
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()} - 
                          </span>
                          <span className="ml-1">
                            {message.role === 'system' ? message.content : `${message.role}: ${message.content}`}
                          </span>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )}

                {/* Info - Original Style */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> This is a test environment. The agent will respond based on your 
                    current configuration. Voice: {agentData.voice}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}