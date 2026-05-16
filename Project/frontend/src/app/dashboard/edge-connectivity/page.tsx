'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EdgeConnectivityDashboard } from '@/modules/edge-connectivity';

export default function EdgeConnectivityRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Edge Connectivity' }]} />
      <EdgeConnectivityDashboard />
    </div>
  );
}
