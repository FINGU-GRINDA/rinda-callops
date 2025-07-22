'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, TestTube, Settings, Activity, Trash2, Edit, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import Link from 'next/link';
import AgentPhoneNumbers from '@/components/features/agent-detail/AgentPhoneNumbers';
import AgentTesting from '@/components/features/agent-detail/AgentTesting';
import AgentSettings from '@/components/features/agent-detail/AgentSettings';
import AgentAnalytics from '@/components/features/agent-detail/AgentAnalytics';

interface Agent {
  id: string;
  name: string;
  business_name: string;
  business_type: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  instructions?: string;
  first_message?: string;
  voice?: string;
  tools?: any[];
  nodes?: any[];
  edges?: any[];
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { makeAuthenticatedRequest } = useAuthenticatedApi();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Wait for auth to load before fetching
    if (!authLoading && user && params.agentId) {
      fetchAgent();
    } else if (!authLoading && !user) {
      // Redirect to login if not authenticated
      router.push('/');
    }
  }, [authLoading, user, params.agentId]);

  const fetchAgent = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/agents/${params.agentId}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await makeAuthenticatedRequest(`/api/agents/${params.agentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete agent');
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const updateAgent = (updatedData: Partial<Agent>) => {
    if (agent) {
      setAgent({ ...agent, ...updatedData });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4 text-center">
              {authLoading ? 'Checking authentication...' : 'Loading agent details...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl text-center">
            <div className="text-white text-lg">Agent not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
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
      
      <div className="relative z-10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{agent.name}</h1>
              <p className="text-gray-300 text-lg">{agent.business_name}</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge 
                  variant={agent.status === 'active' ? 'default' : 'secondary'}
                  className={
                    agent.status === 'active' ? 'bg-green-500' : 
                    agent.status === 'draft' ? 'bg-yellow-500' : 
                    'bg-gray-500'
                  }
                >
                  {agent.status === 'draft' ? 'Building' : agent.status}
                </Badge>
                <Badge variant="outline" className="text-gray-300 border-gray-600/50">
                  {agent.business_type}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href={`/agents/${agent.id}/flow`}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0">
                  <Workflow className="mr-2 h-4 w-4" />
                  Edit Flow
                </Button>
              </Link>
              <Link href={`/agents/${agent.id}/edit`}>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Agent
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="testing" className="space-y-6">
          <TabsList className="bg-slate-800/50 backdrop-blur-xl border-gray-700/50">
            <TabsTrigger value="testing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-white/70">
              <TestTube className="mr-2 h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-white/70">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-white/70">
              <Activity className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="testing">
            <AgentTesting agent={agent} />
          </TabsContent>


          <TabsContent value="settings">
            <AgentSettings agent={agent} onUpdate={updateAgent} />
          </TabsContent>

          <TabsContent value="analytics">
            <AgentAnalytics agentId={agent.id} />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}