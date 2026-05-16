'use client';
import { GPDashboard } from '@/modules/gp';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function GPRoute() { 
  return (
    <RoleGuard roles={['gp', 'doctor', 'super_admin']} requireAll={false}>
      <GPDashboard />
    </RoleGuard>
  ); 
}
