'use client';
import { NetworkDashboard } from '@/modules/network';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function NetworkRoute() { 
  return (
    <RoleGuard roles={['network', 'network-engineer', 'network-management', 'super_admin']} requireAll={false}>
      <NetworkDashboard />
    </RoleGuard>
  ); 
}
