'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IntrusionEventsPanel } from '@/modules/perimeter-security';

export default function PerimeterIntrusionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Perimeter Security' }, { label: 'Intrusion Alerts' }]} />
      <IntrusionEventsPanel />
    </div>
  );
}
