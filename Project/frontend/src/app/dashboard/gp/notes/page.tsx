'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function ClinicalNotes() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'General Physician' }, { label: 'Clinical Notes' }]} />
      <ClinicalDashboard roleTitle="General Physician" />
    </div>);
}
