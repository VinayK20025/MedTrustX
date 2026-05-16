'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalDashboard } from '@/modules/clinical';

export default function InternNotes() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Medical Intern' }, { label: 'Draft Notes' }]} />
      <ClinicalDashboard roleTitle="Medical Intern" />
    </div>);
}
