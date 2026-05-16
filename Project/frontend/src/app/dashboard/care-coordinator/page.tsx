
'use client';
import { CareCoordinatorDashboard } from '@/modules/care-coordinator';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function CareCoordinatorRoute() {
  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <CareCoordinatorDashboard />
    </RoleGuard>
  );
}
