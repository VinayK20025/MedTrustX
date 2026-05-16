'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ReportDistributionPanel } from '@/modules/board-reporting';

export default function BoardDistributionRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board Reporting' }, { label: 'Distribution Tracking' }]} />
      <ReportDistributionPanel />
    </div>
  );
}
