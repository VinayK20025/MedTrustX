'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VitalsTrendsPanel } from '@/modules/intensivist';

export default function VitalsTrendsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Vitals Trends' }]} />
      <VitalsTrendsPanel details={null} />
    </div>
  );
}
