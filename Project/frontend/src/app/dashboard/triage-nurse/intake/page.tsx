'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TriageIntakePanel } from '@/modules/nurse';

export default function TriageIntakePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Triage Nurse' }, { label: 'Intake' }]} />
      <TriageIntakePanel />
    </div>
  );
}
