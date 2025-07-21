'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Phone, 
  Edit, 
  Trash2, 
  MoreVertical,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Agent } from '@/types/models';
import { toast } from 'react-hot-toast';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

export default function AgentsList() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { makeAuthenticatedRequest } = useAuthenticatedApi();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/agents');
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await makeAuthenticatedRequest(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Agent deleted successfully');
        fetchAgents();
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading agents...</div>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Agents Yet</h3>
          <p className="text-gray-600 mb-4">Create your first AI agent to start handling calls</p>
          <Button onClick={() => router.push('/agents/new')}>
            Create Your First Agent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <Card 
          key={agent.id} 
          className={`hover:shadow-lg transition-shadow cursor-pointer ${
            agent.status === 'draft' ? 'border-yellow-500 border-2' : ''
          }`}
          onClick={() => router.push(`/agents/${agent.id}/flow`)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  {agent.name}
                </CardTitle>
                <CardDescription>{agent.business_name}</CardDescription>
              </div>
              <Badge 
                variant={agent.status === 'active' ? 'default' : 'secondary'}
                className={agent.status === 'draft' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}
              >
                {agent.status === 'draft' ? 'Building' : agent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {agent.business_description || agent.business_type}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Voice</p>
                <p className="font-semibold">{agent.voice || 'Default'}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold capitalize">{agent.status}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/agents/${agent.id}/flow`);
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                {agent.status === 'draft' ? 'Continue Building' : 'Edit Flow'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to flow with test modal open (we'll add this functionality)
                  router.push(`/agents/${agent.id}/flow?test=true`);
                }}
              >
                <Phone className="w-4 h-4 mr-1" />
                Test
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAgent(agent.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}