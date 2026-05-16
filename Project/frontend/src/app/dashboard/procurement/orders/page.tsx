'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ProcurementDashboard } from '@/modules/procurement';

const PROCUREMENT_ROLES = ['procurement_manager', 'hospital_admin', 'super_admin'];

export default function Page() {
  return (
    <RoleGuard roles={PROCUREMENT_ROLES}>
      <ProcurementDashboard />
    </RoleGuard>
  );
}
