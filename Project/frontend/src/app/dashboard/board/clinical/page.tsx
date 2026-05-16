'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardClinicalPanel } from '@/modules/board';

export default function BoardClinicalPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Clinical Quality' }]} />
      <BoardClinicalPanel />
    </div>
  );
}
