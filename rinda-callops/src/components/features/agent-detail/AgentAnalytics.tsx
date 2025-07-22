'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Phone, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

interface AgentAnalyticsProps {
  agentId: string;
}

interface Analytics {
  totalCalls: number;
  successfulCalls: number;
  averageDuration: number;
  callsByHour: Record<string, number>;
  recentCalls: any[];
}

export default function AgentAnalytics({ agentId }: AgentAnalyticsProps) {
  const { makeAuthenticatedRequest } = useAuthenticatedApi();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [agentId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/calls/analytics?agentId=${agentId}&timeRange=${timeRange}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white">No analytics data available</p>
      </div>
    );
  }

  const successRate = analytics.totalCalls > 0 
    ? Math.round((analytics.successfulCalls / analytics.totalCalls) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {['24h', '7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded text-sm ${
              timeRange === range
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            {range === '24h' ? 'Last 24 Hours' :
             range === '7d' ? 'Last 7 Days' :
             range === '30d' ? 'Last 30 Days' :
             'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalCalls}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{successRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatDuration(analytics.averageDuration)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Peak Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.entries(analytics.callsByHour).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}:00
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call Distribution */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Call Distribution by Hour</CardTitle>
          <CardDescription className="text-white/70">
            When your agent receives the most calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-end justify-between gap-1">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = analytics.callsByHour[hour] || 0;
              const maxCount = Math.max(...Object.values(analytics.callsByHour));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div
                  key={hour}
                  className="flex-1 bg-blue-500/50 hover:bg-blue-500/70 transition-colors relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {hour}:00 - {count} calls
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription className="text-white/70">
            Latest calls handled by your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentCalls && analytics.recentCalls.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentCalls.map((call: any) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {call.customer?.name || call.customer?.number || 'Unknown'}
                    </p>
                    <p className="text-sm text-white/70">
                      {formatTime(call.startedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={call.status === 'ended' ? 'default' : 'secondary'}
                      className={
                        call.status === 'ended' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {call.status}
                    </Badge>
                    <span className="text-sm text-white/70">
                      {formatDuration(call.duration || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-center py-8">No calls yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}