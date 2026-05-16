'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PerformanceMetricsPanel } from '@/modules/performance-intelligence';

export default function PerformanceMetricsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Performance Intelligence' }, { label: 'Live Metrics' }]} />
      <PerformanceMetricsPanel />
    </div>
  );
}
