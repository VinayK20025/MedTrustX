'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ClinicalPathwaysPanel } from '@/modules/clinical-pathway';

export default function PathwayDefinitionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pathway Intelligence' }, { label: 'Pathway Definitions' }]} />
      <ClinicalPathwaysPanel />
    </div>
  );
}
