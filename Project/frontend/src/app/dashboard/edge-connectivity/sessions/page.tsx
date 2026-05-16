'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConnectivitySessionsPanel } from '@/modules/edge-connectivity';

export default function EdgeSessionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Edge Connectivity' }, { label: 'Tunnel Sessions' }]} />
      <ConnectivitySessionsPanel />
    </div>
  );
}
