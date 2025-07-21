'use client';

import { useState } from 'react';
import EnhancedAgentBuilder from '@/components/features/agent-builder/AgentBuilder';
import FlowAgentBuilder from '@/components/features/agent-builder/visual-builder/FlowAgentBuilder';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Workflow } from 'lucide-react';

export default function NewAgentPage() {
  const [viewMode, setViewMode] = useState<'flow' | 'form'>('flow');

  return (
    <ProtectedRoute>
      {viewMode === 'flow' ? (
        <FlowAgentBuilder onSwitchToForm={() => setViewMode('form')} />
      ) : (
        <EnhancedAgentBuilder onSwitchToFlow={() => setViewMode('flow')} />
      )}
    </ProtectedRoute>
  );
}