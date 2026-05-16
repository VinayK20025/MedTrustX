'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IncidentActionsPanel } from '@/modules/security-incident';

export default function SecIncidentActionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Incident Response' }, { label: 'Response Actions' }]} />
      <IncidentActionsPanel />
    </div>
  );
}
