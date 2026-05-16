'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GraphNodesPanel } from '@/modules/knowledge-graph';

export default function KGraphNodesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Knowledge Graph Engine' }, { label: 'Graph Entities' }]} />
      <GraphNodesPanel />
    </div>
  );
}
