'use client';
import { BloodBankDashboard } from '@/modules/blood-bank';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function BloodBankRoute() {
  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <BloodBankDashboard />
    </RoleGuard>
  );
}
