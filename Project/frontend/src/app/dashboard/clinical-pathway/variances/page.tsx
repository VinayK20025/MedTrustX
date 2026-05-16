'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PathwayVariancesPanel } from '@/modules/clinical-pathway';

export default function PathwayVariancesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Clinical Pathway Intelligence' }, { label: 'Pathway Variances' }]} />
      <PathwayVariancesPanel />
    </div>
  );
}
