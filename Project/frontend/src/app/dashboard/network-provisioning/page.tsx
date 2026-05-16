'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkProvisioningDashboard } from '@/modules/network-provisioning';

export default function NetworkProvisioningRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Network Provisioning' }]} />
      <NetworkProvisioningDashboard />
    </div>
  );
}
