'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperIncidentsPanel } from '@/modules/superintendent';

export default function SuperIncidentsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Incidents & Complaints' }]} />
      <SuperIncidentsPanel />
    </div>
  );
}
