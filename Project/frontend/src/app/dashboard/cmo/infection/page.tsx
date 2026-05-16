'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMOInfectionPanel } from '@/modules/cmo';

export default function CMOInfectionPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Infection Control' }]} />
      <CMOInfectionPanel />
    </div>
  );
}
