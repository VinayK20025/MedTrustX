'use client';
import { CISODashboard } from '@/modules/ciso';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function CISORoute() {
  return (
    <RoleGuard roles={['ciso', 'enterprise-security', 'security-root', 'super_admin']} requireAll={false}>
      <CISODashboard />
    </RoleGuard>
  );
}
