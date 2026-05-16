'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MitigationPlansPanel } from '@/modules/enterprise-risk';

export default function MitigationRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Enterprise Risk' }, { label: 'Mitigation Plans' }]} />
      <MitigationPlansPanel />
    </div>
  );
}
