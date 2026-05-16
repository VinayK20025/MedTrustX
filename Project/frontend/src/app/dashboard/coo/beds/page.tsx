'use client';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOBedsPanel } from '@/modules/coo';

const COO_ROLES = ['hospital_admin', 'super_admin'];

export default function COOBedsPanelRoute() {
  return (
    <RoleGuard roles={COO_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Bed Management' }]} />
        <COOBedsPanel />
      </div>
    </RoleGuard>
  );
}
