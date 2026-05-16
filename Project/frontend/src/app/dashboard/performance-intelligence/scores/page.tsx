'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PerformanceScoresPanel } from '@/modules/performance-intelligence';

export default function PerformanceScoresRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Performance Intelligence' }, { label: 'Health Scores' }]} />
      <PerformanceScoresPanel />
    </div>
  );
}
