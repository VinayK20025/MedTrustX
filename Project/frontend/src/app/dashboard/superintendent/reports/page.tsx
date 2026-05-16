'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperReportsPanel } from '@/modules/superintendent';

export default function SuperReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Daily Reports' }]} />
      <SuperReportsPanel />
    </div>
  );
}
