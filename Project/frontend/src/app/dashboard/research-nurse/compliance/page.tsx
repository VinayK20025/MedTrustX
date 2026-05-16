'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResearchCompliancePanel } from '@/modules/nurse';

export default function ResearchCompliancePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Research Nurse' }, { label: 'Compliance' }]} />
      <ResearchCompliancePanel />
    </div>
  );
}
