'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUReportsPanel } from '@/modules/intensivist';

export default function ICUReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Reports' }]} />
      <ICUReportsPanel />
    </div>
  );
}
