'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOStaffPanel } from '@/modules/coo';

export default function COOStaffPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Staff Allocation' }]} />
      <COOStaffPanel />
    </div>
  );
}
