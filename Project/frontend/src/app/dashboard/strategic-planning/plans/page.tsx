'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StrategicPlanList } from '@/modules/strategic-planning';

export default function PlansRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Strategic Planning' }, { label: 'Master Plans' }]} />
      <StrategicPlanList />
    </div>
  );
}
