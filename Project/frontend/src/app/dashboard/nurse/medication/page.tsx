'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseMedicationPanel } from '@/modules/nurse';

export default function NurseMedicationPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'Medication' }]} />
      <NurseMedicationPanel roleLabel="Staff Nurse" />
    </div>
  );
}
