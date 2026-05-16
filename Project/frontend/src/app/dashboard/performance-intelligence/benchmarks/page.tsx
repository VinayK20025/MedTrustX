'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BenchmarksPanel } from '@/modules/performance-intelligence';

export default function PerformanceBenchmarksRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Performance Intelligence' }, { label: 'Benchmarks' }]} />
      <BenchmarksPanel />
    </div>
  );
}
