'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CNOShiftsPanel } from '@/modules/cno';

export default function CNOShiftsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Shift Management' }]} />
      <CNOShiftsPanel />
    </div>
  );
}
