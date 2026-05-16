'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMOOutcomesPanel } from '@/modules/cmo';

export default function CMOOutcomesPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Outcomes Monitoring' }]} />
      <CMOOutcomesPanel />
    </div>
  );
}
