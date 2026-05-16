'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TriageRoutingPanel } from '@/modules/nurse';

export default function TriageRoutingPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Triage Nurse' }, { label: 'Routing' }]} />
      <TriageRoutingPanel />
    </div>
  );
}
