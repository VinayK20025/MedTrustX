'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOPatientFlowPanel } from '@/modules/coo';

export default function COOPatientFlowPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Patient Flow Management' }]} />
      <COOPatientFlowPanel />
    </div>
  );
}
