'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResearchVisitsPanel } from '@/modules/nurse';

export default function ResearchVisitsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Research Nurse' }, { label: 'Study Visits' }]} />
      <ResearchVisitsPanel />
    </div>
  );
}
