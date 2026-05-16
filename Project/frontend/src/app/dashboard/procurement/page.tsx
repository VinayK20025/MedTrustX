'use client';
import { ProcurementDashboard } from '@/modules/procurement';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function ProcurementRoute() { 
  return (
    <RoleGuard roles={['procurement', 'procurement-exec', 'vendor-management', 'super_admin']} requireAll={false}>
      <ProcurementDashboard />
    </RoleGuard>
  ); 
}
