'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COONursingPanel } from '@/modules/coo';

export default function COONursingPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Nursing Operations' }]} />
      <COONursingPanel />
    </div>
  );
}
