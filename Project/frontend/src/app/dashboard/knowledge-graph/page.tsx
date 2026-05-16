'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { KnowledgeGraphDashboard } from '@/modules/knowledge-graph';

export default function KnowledgeGraphRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Knowledge Graph Engine' }]} />
      <KnowledgeGraphDashboard />
    </div>
  );
}
