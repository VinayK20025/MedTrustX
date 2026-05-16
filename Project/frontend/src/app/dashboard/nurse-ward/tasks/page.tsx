'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseTaskBoard } from '@/modules/nurse';

export default function NurseTaskBoardRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Ward Nurse' }, { label: 'Tasks' }]} />
      <NurseTaskBoard roleLabel="Ward Nurse" />
    </div>
  );
}
