'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkManagementDashboard } from '@/modules/network-management';

export default function NetworkManagementRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Network Management' }]} />
      <NetworkManagementDashboard />
    </div>
  );
}
