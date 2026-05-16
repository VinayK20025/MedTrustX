'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ReportSchedulesPanel } from '@/modules/board-reporting';

export default function BoardSchedulesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board Reporting' }, { label: 'Generation Schedules' }]} />
      <ReportSchedulesPanel />
    </div>
  );
}
