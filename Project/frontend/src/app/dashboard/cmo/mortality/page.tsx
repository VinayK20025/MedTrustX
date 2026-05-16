'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMOMortalityPanel } from '@/modules/cmo';

export default function CMOMortalityPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Mortality Review' }]} />
      <CMOMortalityPanel />
    </div>
  );
}
