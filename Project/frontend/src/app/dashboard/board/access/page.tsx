'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardAccessPanel } from '@/modules/board';

export default function BoardAccessPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'IAM & Security' }]} />
      <BoardAccessPanel />
    </div>
  );
}
