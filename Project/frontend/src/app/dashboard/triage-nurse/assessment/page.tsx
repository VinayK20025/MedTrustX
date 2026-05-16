'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TriageAssessmentPanel } from '@/modules/nurse';

export default function TriageAssessmentPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Triage Nurse' }, { label: 'Assessment' }]} />
      <TriageAssessmentPanel />
    </div>
  );
}
