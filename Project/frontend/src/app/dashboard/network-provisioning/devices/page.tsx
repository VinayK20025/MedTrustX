'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProvisionedDevicesPanel } from '@/modules/network-provisioning';

export default function NetProvDevicesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Provisioning' }, { label: 'Provisioned Appliances' }]} />
      <ProvisionedDevicesPanel />
    </div>
  );
}
