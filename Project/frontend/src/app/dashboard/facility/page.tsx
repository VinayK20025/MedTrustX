'use client';

import { RoleGuard } from '@/components/guards/AuthGuard';
import { FacilityDashboard } from '@/modules/facility';

const FACILITY_ROLES = [
  'facilities_manager',
  'facilities_engineer',
  'admin',
  'super_admin',
  'facilities_tech',
  'maintenance_supervisor',
];

export default function FacilityRoute() {
  return (
    <RoleGuard roles={FACILITY_ROLES}>
      <FacilityDashboard />
    </RoleGuard>
  );
}
