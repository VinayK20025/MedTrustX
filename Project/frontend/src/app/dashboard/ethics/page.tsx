'use client';

import { EthicsDashboard } from '@/modules/ethics';

import { RoleGuard } from '@/components/guards/AuthGuard';

export default function EthicsPage() {
  return (
    <RoleGuard roles={['ethics', 'clinical-ethics', 'research-governance', 'super_admin']} requireAll={false}>
      <EthicsDashboard />
    </RoleGuard>
  );
}
