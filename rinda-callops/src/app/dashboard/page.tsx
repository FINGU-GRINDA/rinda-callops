import EnhancedDashboard from '@/components/features/dashboard/Dashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <EnhancedDashboard />
    </ProtectedRoute>
  );
}