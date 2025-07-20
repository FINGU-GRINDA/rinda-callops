import EnhancedAgentBuilder from '@/components/features/agent-builder/AgentBuilder';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function NewAgentPage() {
  return (
    <ProtectedRoute>
      <EnhancedAgentBuilder />
    </ProtectedRoute>
  );
}