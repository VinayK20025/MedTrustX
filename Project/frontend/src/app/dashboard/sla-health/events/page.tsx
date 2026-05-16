'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HealthEventsPanel } from '@/modules/sla-health';

export default function HealthEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SLA & Service Health' }, { label: 'Telemetry Events' }]} />
      <HealthEventsPanel />
    </div>
  );
}
