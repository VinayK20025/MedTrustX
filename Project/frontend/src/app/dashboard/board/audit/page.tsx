'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardAuditPanel } from '@/modules/board';

export default function BoardAuditPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Audit & Risk' }]} />
      <BoardAuditPanel />
    </div>
  );
}
