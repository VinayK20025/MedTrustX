'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OptimizationResultsPanel } from '@/modules/resource-optimization';

export default function ResOptResultsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Resource Optimization Engine' }, { label: 'Optimization Insights' }]} />
      <OptimizationResultsPanel />
    </div>
  );
}
