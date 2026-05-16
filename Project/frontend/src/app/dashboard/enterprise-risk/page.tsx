'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EnterpriseRiskDashboard } from '@/modules/enterprise-risk';

export default function EnterpriseRiskRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Enterprise Risk Oversight' }]} />
      <EnterpriseRiskDashboard />
    </div>
  );
}
