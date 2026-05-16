'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SecurityIncidentDashboard } from '@/modules/security-incident';

export default function SecurityIncidentRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Incident Response' }]} />
      <SecurityIncidentDashboard />
    </div>
  );
}
