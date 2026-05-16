'use client';
import { HospitalAdminDashboard } from '@/modules/hospital-admin';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function HospitalAdminRoute() {
  return (
    <RoleGuard roles={['hospital_admin', 'operations', 'super_admin']} requireAll={false}>
      <HospitalAdminDashboard />
    </RoleGuard>
  );
}
