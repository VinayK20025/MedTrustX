'use client';
import { UebaDashboard } from '@/modules/ueba';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function UebaRoute() {
  return (
    <RoleGuard roles={['ciso', 'security_engineer', 'super_admin']}>
      <UebaDashboard />
    </RoleGuard>
  );
}
