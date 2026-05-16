'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LocationsPanel } from '@/modules/asset-tracking';

export default function RTLSLocationsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Asset Tracking' }, { label: 'Real-Time Locations' }]} />
      <LocationsPanel />
    </div>
  );
}
