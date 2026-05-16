'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOReportsPanel } from '@/modules/coo';

export default function COOReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Operational Reports' }]} />
      <COOReportsPanel />
    </div>
  );
}
