'use client';
import { PathologistDashboard } from '@/modules/pathologist';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function PathologistRoute() {
  return (
    <RoleGuard roles={['pathologist', 'super_admin']}>
      <PathologistDashboard />
    </RoleGuard>
  );
}
