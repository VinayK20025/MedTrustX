'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPathwayDashboard } from '@/modules/clinical-pathway';

export default function ClinicalPathwayRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Clinical Pathway Intelligence' }]} />
      <ClinicalPathwayDashboard />
    </div>
  );
}
