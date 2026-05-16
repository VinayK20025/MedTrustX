'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PerformanceIntelligenceDashboard } from '@/modules/performance-intelligence';

export default function PerformanceIntelligenceRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Performance Intelligence' }]} />
      <PerformanceIntelligenceDashboard />
    </div>
  );
}
