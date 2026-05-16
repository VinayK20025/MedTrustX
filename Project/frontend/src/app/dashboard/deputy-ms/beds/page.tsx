'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyBedsPanel } from '@/modules/deputy-ms';

export default function DeputyBedsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Bed Allocation' }]} />
      <DeputyBedsPanel />
    </div>
  );
}
