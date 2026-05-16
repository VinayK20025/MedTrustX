'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResearchDataPanel } from '@/modules/nurse';

export default function ResearchDataPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Research Nurse' }, { label: 'Data Collection' }]} />
      <ResearchDataPanel />
    </div>
  );
}
