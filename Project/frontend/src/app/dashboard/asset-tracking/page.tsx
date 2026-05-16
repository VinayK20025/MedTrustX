'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AssetTrackingDashboard } from '@/modules/asset-tracking';

export default function AssetTrackingRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Asset Tracking (RTLS)' }]} />
      <AssetTrackingDashboard />
    </div>
  );
}
