'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworksPanel } from '@/modules/network-provisioning';

export default function NetProvNetworksRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Provisioning' }, { label: 'Provisioned Networks' }]} />
      <NetworksPanel />
    </div>
  );
}
