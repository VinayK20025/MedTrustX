'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MovementEventsPanel } from '@/modules/asset-tracking';

export default function RTLSMovementsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Asset Tracking' }, { label: 'Zone Transitions' }]} />
      <MovementEventsPanel />
    </div>
  );
}
