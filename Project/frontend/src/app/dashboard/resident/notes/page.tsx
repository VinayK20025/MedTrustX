'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function ResidentNotes() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Resident Doctor' }, { label: 'Clinical Notes' }]} />
      <ClinicalDashboard roleTitle="Resident Doctor" />
    </div>);
}
