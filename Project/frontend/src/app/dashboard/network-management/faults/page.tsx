'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FaultEventsPanel } from '@/modules/network-management';

export default function NetMgmtFaultsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Management' }, { label: 'Fault Events' }]} />
      <FaultEventsPanel />
    </div>
  );
}
