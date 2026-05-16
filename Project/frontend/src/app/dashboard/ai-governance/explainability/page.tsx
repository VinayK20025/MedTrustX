'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ExplainabilityReportsPanel } from '@/modules/ai-governance';

export default function AiExplainabilityRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Explainability Reports' }]} />
      <ExplainabilityReportsPanel />
    </div>
  );
}
