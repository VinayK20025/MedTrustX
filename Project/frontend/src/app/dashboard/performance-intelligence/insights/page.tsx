'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OptimizationInsightsPanel } from '@/modules/performance-intelligence';

export default function PerformanceInsightsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Performance Intelligence' }, { label: 'Optimization Insights' }]} />
      <OptimizationInsightsPanel />
    </div>
  );
}
