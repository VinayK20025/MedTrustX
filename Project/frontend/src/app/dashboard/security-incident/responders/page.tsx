'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RespondersPanel } from '@/modules/security-incident';

export default function SecIncidentRespondersRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Incident Response' }, { label: 'Responders' }]} />
      <RespondersPanel />
    </div>
  );
}
