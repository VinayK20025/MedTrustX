'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ReportRegistryPanel } from '@/modules/board-reporting';

export default function BoardReportsRegistryRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board Reporting' }, { label: 'Report Registry' }]} />
      <ReportRegistryPanel />
    </div>
  );
}
