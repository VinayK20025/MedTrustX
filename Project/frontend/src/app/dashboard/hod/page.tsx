'use client';
import { HODDashboard } from '@/modules/hod';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function HODRoute() { 
  return (
    <RoleGuard roles={['hod', 'super_admin']}>
      <HODDashboard />
    </RoleGuard>
  ); 
}
