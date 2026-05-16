'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOEscalationsPanel } from '@/modules/coo';

export default function COOEscalationsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Escalations' }]} />
      <COOEscalationsPanel />
    </div>
  );
}
