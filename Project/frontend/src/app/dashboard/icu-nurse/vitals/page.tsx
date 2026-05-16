'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICULiveVitalsPanel } from '@/modules/nurse';

export default function ICULiveVitalsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'ICU Nurse' }, { label: 'Live Vitals' }]} />
      <ICULiveVitalsPanel />
    </div>
  );
}
