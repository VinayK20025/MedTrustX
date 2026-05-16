'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseRoundsPanel } from '@/modules/nurse';

export default function NurseRoundsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'Nursing Rounds' }]} />
      <NurseRoundsPanel />
    </div>
  );
}
