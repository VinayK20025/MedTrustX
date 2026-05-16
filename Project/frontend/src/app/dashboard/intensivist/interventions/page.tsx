'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUInterventionsPanel } from '@/modules/intensivist';

export default function ICUInterventionsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Active Treatments' }]} />
      <ICUInterventionsPanel />
    </div>
  );
}
