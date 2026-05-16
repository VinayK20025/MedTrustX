'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GraphQueriesPanel } from '@/modules/knowledge-graph';

export default function KGraphQueriesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Knowledge Graph Engine' }, { label: 'Cypher Query Logs' }]} />
      <GraphQueriesPanel />
    </div>
  );
}
