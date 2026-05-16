'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOTasksPanel } from '@/modules/coo';

export default function COOTasksPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Task Execution' }]} />
      <COOTasksPanel />
    </div>
  );
}
