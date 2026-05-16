'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DigitalTwinsPanel } from '@/modules/digital-twin';

export default function DigitalTwinEntitiesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Digital Twin Engine' }, { label: 'Active Replicas' }]} />
      <DigitalTwinsPanel />
    </div>
  );
}
