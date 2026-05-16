'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperPatientFlowPanel } from '@/modules/superintendent';

export default function SuperPatientFlowPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Admissions & Discharges' }]} />
      <SuperPatientFlowPanel />
    </div>
  );
}
