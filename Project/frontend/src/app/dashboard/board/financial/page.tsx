'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardFinancialPanel } from '@/modules/board';

export default function BoardFinancialPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Financial Performance' }]} />
      <BoardFinancialPanel />
    </div>
  );
}
