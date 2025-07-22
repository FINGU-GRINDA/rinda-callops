'use client';

import { useParams } from 'next/navigation';
import FlowAgentBuilder from '@/components/features/agent-builder/visual-builder/FlowAgentBuilder';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AgentFlowPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  // Pass the agent ID to FlowAgentBuilder through a wrapper that sets the search params
  return (
    <ProtectedRoute>
      <FlowAgentBuilderWrapper agentId={agentId} />
    </ProtectedRoute>
  );
}

function FlowAgentBuilderWrapper({ agentId }: { agentId: string }) {
  return <FlowAgentBuilder existingAgentId={agentId} />;
}