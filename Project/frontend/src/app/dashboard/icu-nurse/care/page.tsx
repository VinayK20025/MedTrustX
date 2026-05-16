'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUCareMedsPanel } from '@/modules/nurse';

export default function ICUCareMedsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'ICU Nurse' }, { label: 'Care & Meds' }]} />
      <ICUCareMedsPanel />
    </div>
  );
}
