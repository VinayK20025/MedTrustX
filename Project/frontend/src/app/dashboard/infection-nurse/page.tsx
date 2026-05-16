'use client';
import { InfectionControlDashboard } from '@/modules/infection-control';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function InfectionNurseRoute() {
  return (
    <RoleGuard roles={['infection-nurse', 'infection-control', 'epidemiology-user', 'super_admin']} requireAll={false}>
      <InfectionControlDashboard />
    </RoleGuard>
  );
}
