'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUPatientDetailPanel } from '@/modules/nurse';

export default function ICUPatientDetailPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'ICU Nurse' }, { label: 'Patient Detail' }]} />
      <ICUPatientDetailPanel />
    </div>
  );
}
