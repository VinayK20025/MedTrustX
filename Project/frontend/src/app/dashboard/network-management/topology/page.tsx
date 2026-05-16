'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkTopologyPanel } from '@/modules/network-management';

export default function NetMgmtTopologyRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Management' }, { label: 'Topology Map' }]} />
      <NetworkTopologyPanel />
    </div>
  );
}
