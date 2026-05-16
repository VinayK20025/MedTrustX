'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IncidentsPanel } from '@/modules/security-incident';

export default function SecIncidentListRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Incident Response' }, { label: 'Active Incidents' }]} />
      <IncidentsPanel />
    </div>
  );
}
