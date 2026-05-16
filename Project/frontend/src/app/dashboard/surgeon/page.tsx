'use client';
import { SurgeonDashboard } from '@/modules/surgeon';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function SurgeonRoute() {
  return (
    <RoleGuard roles={['surgeon', 'super_admin']}>
      <SurgeonDashboard />
    </RoleGuard>
  );
}
