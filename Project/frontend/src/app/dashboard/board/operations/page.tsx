'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardOperationsPanel } from '@/modules/board';

export default function BoardOperationsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Operational Efficiency' }]} />
      <BoardOperationsPanel />
    </div>
  );
}
