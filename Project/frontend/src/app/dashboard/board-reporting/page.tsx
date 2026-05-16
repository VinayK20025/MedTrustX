'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardReportingDashboard } from '@/modules/board-reporting';

export default function BoardReportingRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Board Reporting' }]} />
      <BoardReportingDashboard />
    </div>
  );
}
