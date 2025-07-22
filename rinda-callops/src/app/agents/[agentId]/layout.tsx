import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AgentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}