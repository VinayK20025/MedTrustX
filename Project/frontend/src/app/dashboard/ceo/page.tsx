'use client';
import { CEODashboard } from '@/modules/ceo';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function CEORoute() {
  return (
    <RoleGuard roles={['ceo', 'super_admin']}>
      <CEODashboard />
    </RoleGuard>
  );
}
