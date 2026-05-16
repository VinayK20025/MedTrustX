'use client';
import { RiskDashboard } from '@/modules/infosec-risk';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function RiskRoute() { 
  return (
    <RoleGuard roles={['infosec-risk', 'infosec-compliance', 'security-governance', 'super_admin']} requireAll={false}>
      <RiskDashboard />
    </RoleGuard>
  ); 
}
