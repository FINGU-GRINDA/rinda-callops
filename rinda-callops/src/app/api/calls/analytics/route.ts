import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/admin';

// GET /api/calls/analytics - Get call analytics
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // First get all calls for the user
    let query = db.collection('calls')
      .where('userId', '==', userId);

    if (agentId) {
      query = query.where('agentId', '==', agentId);
    }

    const callsSnapshot = await query.get();
    
    // Filter by date in memory to avoid composite index requirement
    const calls = callsSnapshot.docs
      .map((doc: { data: () => any; }) => doc.data())
      .filter((call: any) => {
        const callDate = call.startedAt?.toDate ? call.startedAt.toDate() : new Date(call.startedAt);
        return callDate >= startDate;
      });

    // Calculate analytics
    const totalCalls = calls.length;
    const completedCalls = calls.filter((call: { status: string; }) => call.status === 'ended').length;
    const failedCalls = calls.filter((call: { status: string; }) => call.status === 'failed').length;
    const avgDuration = calls
      .filter((call: { duration: number; }) => call.duration)
      .reduce((sum: number, call: { duration: number; }) => sum + (call.duration || 0), 0) / (completedCalls || 1);

    // Calculate hourly distribution
    const hourlyDistribution = Array(24).fill(0);
    calls.forEach((call: { startedAt: { toDate: () => any; }; }) => {
      const hour = new Date(call.startedAt.toDate()).getHours();
      hourlyDistribution[hour]++;
    });

    // Calculate daily trend
    const dailyTrend: Record<string, number> = {};
    calls.forEach((call: { startedAt: { toDate: () => any; }; }) => {
      const date = new Date(call.startedAt.toDate()).toISOString().split('T')[0];
      dailyTrend[date] = (dailyTrend[date] || 0) + 1;
    });

    // Calculate status distribution
    const statusDistribution = calls.reduce((acc: Record<string, number>, call: { status: string; }) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate cost estimate (assuming $0.05 per minute)
    const totalMinutes = calls.reduce((sum: number, call: { duration: number; }) => 
      sum + Math.ceil((call.duration || 0) / 60), 0
    );
    const estimatedCost = totalMinutes * 0.05;

    return NextResponse.json({
      analytics: {
        summary: {
          totalCalls,
          completedCalls,
          failedCalls,
          completionRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
          avgDuration,
          totalMinutes,
          estimatedCost
        },
        hourlyDistribution,
        dailyTrend,
        statusDistribution,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching call analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}