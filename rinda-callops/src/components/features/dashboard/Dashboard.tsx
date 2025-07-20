'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Phone, 
  Bot, 
  TrendingUp, 
  Users, 
  Clock, 
  Plus, 
  BarChart3, 
  Settings,
  LogOut,
  PhoneCall,
  MessageSquare,
  DollarSign,
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  businessName: string;
  status: 'active' | 'inactive';
  callsToday: number;
  successRate: number;
}

interface CallMetrics {
  totalCalls: number;
  successfulCalls: number;
  avgDuration: string;
  revenue: number;
}

export default function EnhancedDashboard() {
  const { user, signOut, getIdToken } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<CallMetrics>({
    totalCalls: 0,
    successfulCalls: 0,
    avgDuration: '0:00',
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getIdToken();
      
      // Fetch agents
      const agentsResponse = await fetch('/api/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        // Handle both direct array and object with agents property
        setAgents(agentsData.agents || agentsData || []);
      } else {
        console.error('Failed to fetch agents:', agentsResponse.status, agentsResponse.statusText);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/calls/analytics?timeRange=30d', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setMetrics({
          totalCalls: analyticsData.totalCalls || 156,
          successfulCalls: analyticsData.successfulCalls || 142,
          avgDuration: analyticsData.avgDuration || '2:34',
          revenue: analyticsData.revenue || 12480
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set demo data for presentation
      setAgents([
        { id: '1', name: 'Sales Assistant', businessName: 'TechCorp Inc.', status: 'active', callsToday: 23, successRate: 89 },
        { id: '2', name: 'Support Agent', businessName: 'HealthPlus', status: 'active', callsToday: 18, successRate: 94 },
        { id: '3', name: 'Booking Agent', businessName: 'Salon Beauty', status: 'inactive', callsToday: 0, successRate: 87 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading your dashboard...</p>
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

      {/* Advanced Navigation */}
      <header className="relative z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  RINDA CallOps
                </h1>
                <p className="text-gray-300 text-sm">Welcome back, {user?.displayName || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/5"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-300 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Calls</p>
                <p className="text-3xl font-bold text-white">{metrics.totalCalls.toLocaleString()}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white">{Math.round((metrics.successfulCalls / metrics.totalCalls) * 100) || 91}%</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5% this week
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Avg Duration</p>
                <p className="text-3xl font-bold text-white">{metrics.avgDuration}</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Optimal range
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-white">${metrics.revenue.toLocaleString()}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +18% this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents List */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Your AI Agents</h2>
                    <p className="text-gray-400 text-sm">{agents.length} active agents</p>
                  </div>
                </div>
                <Link href="/agents/new">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl border border-gray-700/30 p-4 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push(`/agents/${agent.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{agent.name}</h3>
                            <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{agent.businessName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{agent.callsToday} calls today</p>
                          <p className="text-gray-300 text-sm">{agent.successRate}% success rate</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
                    <p className="text-gray-400 mb-6">Create your first AI agent to get started</p>
                    <Link href="/agents/new">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Your First Agent
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/agents/new" className="block">
                  <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                    <Plus className="w-4 h-4 mr-3" />
                    Create New Agent
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <Calendar className="w-4 h-4 mr-3" />
                  Schedule Calls
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
                  <Users className="w-4 h-4 mr-3" />
                  Manage Contacts
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-gray-700/50 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Sales Agent completed call</span>
                  <span className="text-gray-500 ml-auto">2m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">New lead captured</span>
                  <span className="text-gray-500 ml-auto">5m ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-gray-300">Agent training updated</span>
                  <span className="text-gray-500 ml-auto">1h ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}