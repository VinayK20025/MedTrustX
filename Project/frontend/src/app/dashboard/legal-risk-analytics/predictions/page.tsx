'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PredictiveModelsPanel } from '@/modules/legal-risk-analytics';

export default function LegalRiskPredictionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Risk Analytics' }, { label: 'Predictive Models' }]} />
      <PredictiveModelsPanel />
    </div>
  );
}
