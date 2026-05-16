'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ERTriageQueuePanel } from '@/modules/nurse';

export default function ERTriageQueuePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Triage Nurse' }, { label: 'Queue' }]} />
      <ERTriageQueuePanel />
    </div>
  );
}
