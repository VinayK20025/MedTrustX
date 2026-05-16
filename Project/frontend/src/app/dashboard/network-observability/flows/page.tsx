'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NetworkFlowsPanel } from '@/modules/network-observability';

export default function NetworkFlowsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Observability' }, { label: 'Flow Records' }]} />
      <NetworkFlowsPanel />
    </div>
  );
}
