'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BiasMetricsPanel } from '@/modules/ai-governance';

export default function AiBiasRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'AI Governance' }, { label: 'Bias & Fairness Metrics' }]} />
      <BiasMetricsPanel />
    </div>
  );
}
