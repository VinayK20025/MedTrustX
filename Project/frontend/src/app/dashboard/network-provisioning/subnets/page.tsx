'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SubnetsPanel } from '@/modules/network-provisioning';

export default function NetProvSubnetsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Provisioning' }, { label: 'Subnet Segments' }]} />
      <SubnetsPanel />
    </div>
  );
}
