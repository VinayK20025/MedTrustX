'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GraphEdgesPanel } from '@/modules/knowledge-graph';

export default function KGraphEdgesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Knowledge Graph Engine' }, { label: 'Semantic Relationships' }]} />
      <GraphEdgesPanel />
    </div>
  );
}
