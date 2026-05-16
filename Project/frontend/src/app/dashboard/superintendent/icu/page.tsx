'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUExecutiveOverview } from '@/modules/intensivist';

export default function ICUExecutiveOverviewRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'ICU Coordination' }]} />
      <ICUExecutiveOverview roleLabel="Superintendent" />
    </div>
  );
}
