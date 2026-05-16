'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OptimizationRunsPanel } from '@/modules/resource-optimization';

export default function ResOptRunsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Resource Optimization Engine' }, { label: 'AI Optimization Execution' }]} />
      <OptimizationRunsPanel />
    </div>
  );
}
