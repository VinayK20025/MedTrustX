'use client';
import { SuperAdminDashboard } from '@/modules/super-admin';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function SuperAdminRoute() { 
  return (
    <RoleGuard roles={['super_admin', 'ceo', 'enterprise-root']} requireAll={false}>
      <SuperAdminDashboard />
    </RoleGuard>
  ); 
}
