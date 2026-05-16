'use client';
import { ItDashboard } from '@/modules/it';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function ItRoute() { 
  return (
    <RoleGuard roles={['it', 'system-administrator', 'it-ops', 'super_admin']} requireAll={false}>
      <ItDashboard />
    </RoleGuard>
  ); 
}
