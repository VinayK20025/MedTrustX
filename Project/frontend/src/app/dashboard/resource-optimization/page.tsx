'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResourceOptimizationDashboard } from '@/modules/resource-optimization';

export default function ResourceOptimizationRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Resource Optimization Engine' }]} />
      <ResourceOptimizationDashboard />
    </div>
  );
}
