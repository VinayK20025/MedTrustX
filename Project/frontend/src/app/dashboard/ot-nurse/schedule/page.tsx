'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTSchedulePanel } from '@/modules/nurse';

export default function OTSchedulePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Nurse' }, { label: 'Schedule' }]} />
      <OTSchedulePanel />
    </div>
  );
}
