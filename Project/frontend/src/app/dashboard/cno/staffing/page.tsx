'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CNOStaffingPanel } from '@/modules/cno';

export default function CNOStaffingPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Staffing Allocation' }]} />
      <CNOStaffingPanel />
    </div>
  );
}
