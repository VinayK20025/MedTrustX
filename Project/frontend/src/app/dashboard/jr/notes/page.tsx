'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function JRNotes() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Junior Resident' }, { label: 'Basic Notes' }]} />
      <ClinicalDashboard roleTitle="Junior Resident" />
    </div>);
}
