'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTActiveSurgeryPanel } from '@/modules/nurse';

export default function OTActiveSurgeryPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Nurse' }, { label: 'Active Surgery' }]} />
      <OTActiveSurgeryPanel />
    </div>
  );
}
