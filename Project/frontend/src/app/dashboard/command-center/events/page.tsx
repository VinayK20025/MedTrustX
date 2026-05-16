'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OperationalEventsPanel } from '@/modules/command-center';

export default function CmdEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operational Command Center' }, { label: 'Cross-System Events' }]} />
      <OperationalEventsPanel />
    </div>
  );
}
