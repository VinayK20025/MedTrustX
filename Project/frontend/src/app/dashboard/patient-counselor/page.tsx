'use client';
import { PatientCounselorDashboard } from '@/modules/patient-counselor';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function PatientCounselorRoute() {
  return (
    <RoleGuard roles={['patient-counselor', 'social-work', 'super_admin']} requireAll={false}>
      <PatientCounselorDashboard />
    </RoleGuard>
  );
}
