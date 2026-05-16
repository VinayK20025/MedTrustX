'use client';
import { FrontDeskDashboard } from '@/modules/front-desk';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function FrontDeskRoute() {
  return (
    <RoleGuard roles={['front-desk', 'visitor-management', 'admission-scheduler', 'super_admin']} requireAll={false}>
      <FrontDeskDashboard />
    </RoleGuard>
  );
}
