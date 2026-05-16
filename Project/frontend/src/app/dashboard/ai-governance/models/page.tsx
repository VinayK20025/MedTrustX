'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AiModelsPanel } from '@/modules/ai-governance';

export default function AiModelsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Governed AI Models' }]} />
      <AiModelsPanel />
    </div>
  );
}
