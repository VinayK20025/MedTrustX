'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EventsPanel } from '@/modules/iot';

export default function IotEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'IoT Messaging' }, { label: 'Lifecycle Events' }]} />
      <EventsPanel />
    </div>
  );
}
