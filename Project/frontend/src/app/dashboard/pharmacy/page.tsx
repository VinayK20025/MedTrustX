'use client';
import { PharmacyDashboard } from '@/modules/pharmacy';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function PharmacyRoute() {
  return (
    <RoleGuard roles={['pharmacy', 'super_admin']}>
      <PharmacyDashboard />
    </RoleGuard>
  );
}
