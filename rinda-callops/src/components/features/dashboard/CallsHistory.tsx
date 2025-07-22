'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Calendar,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { Call } from '@/types/models';

export default function CallsHistory() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async (startAfter?: string) => {
    try {
      const url = `/api/calls${startAfter ? `?startAfter=${startAfter}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalls(prev => startAfter ? [...prev, ...data.calls] : data.calls);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ended':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calls...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>View and manage your call history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No calls yet</p>
            </div>
          ) : (
            <>
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming className="w-5 h-5 text-blue-600" />
                      ) : (
                        <PhoneOutgoing className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {call.customerPhone || call.customerNumber || 'Unknown'}
                        </p>
                        <Badge variant={getStatusColor(call.status)}>
                          {call.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(call.startedAt), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(call.startedAt), 'h:mm a')}
                        </span>
                        {call.duration && (
                          <span>{formatDuration(call.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {call.cost && (
                      <span className="text-sm font-medium">
                        ${call.cost.toFixed(2)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // View call details
                        window.location.href = `/calls/${call.id}`;
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchCalls(calls[calls.length - 1].id)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}