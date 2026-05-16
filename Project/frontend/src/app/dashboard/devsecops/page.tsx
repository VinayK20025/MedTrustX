'use client';
import { DevSecOpsDashboard } from '@/modules/devsecops';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function DevSecOpsRoute() { 
  return (
    <RoleGuard roles={['devsecops', 'platform-engineer', 'cloud-security', 'super_admin']} requireAll={false}>
      <DevSecOpsDashboard />
    </RoleGuard>
  ); 
}
