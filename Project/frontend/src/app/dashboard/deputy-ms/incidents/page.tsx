'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyIncidentsPanel } from '@/modules/deputy-ms';

export default function DeputyIncidentsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Incident Reports' }]} />
      <DeputyIncidentsPanel />
    </div>
  );
}
