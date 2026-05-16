'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AnomaliesPanel } from '@/modules/network-observability';

export default function NetworkAnomaliesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Observability' }, { label: 'Detected Anomalies' }]} />
      <AnomaliesPanel />
    </div>
  );
}
