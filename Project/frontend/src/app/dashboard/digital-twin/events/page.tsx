'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TwinEventsPanel } from '@/modules/digital-twin';

export default function TwinEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Digital Twin Engine' }, { label: 'Lifecycle Events' }]} />
      <TwinEventsPanel />
    </div>
  );
}
