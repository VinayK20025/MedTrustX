'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InferenceResultsPanel } from '@/modules/knowledge-graph';

export default function KGraphInferenceRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Knowledge Graph Engine' }, { label: 'AI Inferences' }]} />
      <InferenceResultsPanel />
    </div>
  );
}
