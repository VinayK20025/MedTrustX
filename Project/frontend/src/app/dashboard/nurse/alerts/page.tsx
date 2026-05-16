'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { NurseAlertsSharedPanel } from '@/modules/nurse';

export default function NurseAlertsSharedPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Staff Nurse' }, { label: 'Alerts' }]} />
      <NurseAlertsSharedPanel roleLabel="Staff Nurse" />
    </div>
  );
}
