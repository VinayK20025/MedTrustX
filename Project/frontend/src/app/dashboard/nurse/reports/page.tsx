'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseReportsPanel } from '@/modules/nurse';

export default function NurseReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'Reports' }]} />
      <NurseReportsPanel roleLabel="Staff Nurse" />
    </div>
  );
}
