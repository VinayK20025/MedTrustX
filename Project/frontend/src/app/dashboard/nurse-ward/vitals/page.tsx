'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseVitalsPanel } from '@/modules/nurse';

export default function NurseVitalsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Ward Nurse' }, { label: 'Vitals' }]} />
      <NurseVitalsPanel roleLabel="Ward Nurse" />
    </div>
  );
}
