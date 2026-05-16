'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyStaffPanel } from '@/modules/deputy-ms';

export default function DeputyStaffPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Staff Coverage' }]} />
      <DeputyStaffPanel />
    </div>
  );
}
