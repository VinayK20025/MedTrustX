'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyPatientFlowPanel } from '@/modules/deputy-ms';

export default function DeputyPatientFlowPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Patient Flow' }]} />
      <DeputyPatientFlowPanel />
    </div>
  );
}
