'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LegalRiskDashboard } from '@/modules/legal-risk-analytics';

export default function LegalRiskAnalyticsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Risk Analytics' }]} />
      <LegalRiskDashboard />
    </div>
  );
}
