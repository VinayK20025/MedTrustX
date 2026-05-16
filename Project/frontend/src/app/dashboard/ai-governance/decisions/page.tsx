'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ModelDecisionsPanel } from '@/modules/ai-governance';

export default function AiDecisionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Model Decisions Audit' }]} />
      <ModelDecisionsPanel />
    </div>
  );
}
