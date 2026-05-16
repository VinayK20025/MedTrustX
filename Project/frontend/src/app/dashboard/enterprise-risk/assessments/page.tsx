'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RiskAssessmentsPanel } from '@/modules/enterprise-risk';

export default function AssessmentsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Enterprise Risk' }, { label: 'Quantitative Assessments' }]} />
      <RiskAssessmentsPanel />
    </div>
  );
}
