'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CEOTasksPanel } from '@/modules/ceo';

export default function CEOTasksPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Task Center' }]} />
      <CEOTasksPanel />
    </div>
  );
}
