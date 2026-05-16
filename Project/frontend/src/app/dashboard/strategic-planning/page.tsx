'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StrategyDashboard } from '@/modules/strategic-planning';

export default function StrategicPlanningRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Strategic Planning' }]} />
      <StrategyDashboard />
    </div>
  );
}
