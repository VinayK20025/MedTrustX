'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RiskFactorsPanel } from '@/modules/legal-risk-analytics';

export default function LegalRiskFactorsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Risk Analytics' }, { label: 'Contributing Factors' }]} />
      <RiskFactorsPanel />
    </div>
  );
}
