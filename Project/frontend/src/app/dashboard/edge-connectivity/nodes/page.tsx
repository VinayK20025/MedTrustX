'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EdgeNodesPanel } from '@/modules/edge-connectivity';

export default function EdgeNodesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Edge Connectivity' }, { label: 'Edge Node Fleet' }]} />
      <EdgeNodesPanel />
    </div>
  );
}
