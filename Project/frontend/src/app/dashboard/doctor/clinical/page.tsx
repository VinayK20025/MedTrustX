'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function ClinicalRecords() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Doctor' }, { label: 'Clinical Records' }]} />
      <ClinicalDashboard roleTitle="Doctor" />
    </div>);
}
