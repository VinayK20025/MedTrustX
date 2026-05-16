'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IncidentsPanel } from '@/modules/command-center';

export default function CmdIncidentsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operational Command Center' }, { label: 'Active Incidents' }]} />
      <IncidentsPanel />
    </div>
  );
}
