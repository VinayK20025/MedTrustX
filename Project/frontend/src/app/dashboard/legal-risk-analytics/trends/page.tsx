'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrendAnalysisPanel } from '@/modules/legal-risk-analytics';

export default function LegalRiskTrendsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Risk Analytics' }, { label: 'Historical Trends' }]} />
      <TrendAnalysisPanel />
    </div>
  );
}
