'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOQueuePanel } from '@/modules/coo';

export default function COOQueuePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Queue Management' }]} />
      <COOQueuePanel />
    </div>
  );
}
