'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RiskScoresPanel } from '@/modules/legal-risk-analytics';

export default function LegalRiskScoresRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Risk Analytics' }, { label: 'Case Risk Scores' }]} />
      <RiskScoresPanel />
    </div>
  );
}
