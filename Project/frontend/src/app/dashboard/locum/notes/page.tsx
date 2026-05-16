'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function LocumNotes() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Locum Doctor' }, { label: 'Clinical Notes' }]} />
      <ClinicalDashboard roleTitle="Locum Doctor" />
    </div>);
}
