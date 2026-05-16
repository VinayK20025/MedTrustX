'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CEOReportsPanel } from '@/modules/ceo';

export default function CEOReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Reports & Forecasting' }]} />
      <CEOReportsPanel />
    </div>
  );
}
