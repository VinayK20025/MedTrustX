'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrafficMetricsPanel } from '@/modules/network-observability';

export default function NetworkTrafficRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Observability' }, { label: 'Traffic Statistics' }]} />
      <TrafficMetricsPanel />
    </div>
  );
}
