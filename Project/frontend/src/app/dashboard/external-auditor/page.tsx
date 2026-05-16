'use client';
import { AuditorDashboard } from '@/modules/external-auditor';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function AuditorRoute() { 
  return (
    <RoleGuard roles={['external-auditor', 'audit-reviewer', 'regulatory-auditor', 'super_admin']} requireAll={false}>
      <AuditorDashboard />
    </RoleGuard>
  ); 
}
