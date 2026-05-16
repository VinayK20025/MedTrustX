'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IPAllocationsPanel } from '@/modules/network-provisioning';

export default function NetProvIPAllocRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Provisioning' }, { label: 'IP Allocations' }]} />
      <IPAllocationsPanel />
    </div>
  );
}
