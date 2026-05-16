'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LitigationTrackingDashboard } from '@/modules/litigation-tracking';

export default function LitigationTrackingRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Litigation Tracking' }]} />
      <LitigationTrackingDashboard />
    </div>
  );
}
