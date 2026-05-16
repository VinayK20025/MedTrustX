'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { NotificationsOrchestratorDashboard } from '@/modules/notifications-orchestrator';

const ORCHESTRATOR_ROLES = ['super_admin', 'hospital_admin', 'tenant_admin', 'security_officer', 'compliance_officer'];

export default function Page() {
  return (
    <RoleGuard roles={ORCHESTRATOR_ROLES}>
      <NotificationsOrchestratorDashboard />
    </RoleGuard>
  );
}
