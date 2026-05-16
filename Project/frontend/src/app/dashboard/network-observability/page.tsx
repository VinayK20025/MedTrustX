'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkObservabilityDashboard } from '@/modules/network-observability';

export default function NetworkObservabilityRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Network Observability' }]} />
      <NetworkObservabilityDashboard />
    </div>
  );
}
