'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardReportsPanel } from '@/modules/board';

export default function BoardReportsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Board Reports' }]} />
      <BoardReportsPanel />
    </div>
  );
}
