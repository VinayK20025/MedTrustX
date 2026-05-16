'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CNOTasksPanel } from '@/modules/cno';

export default function CNOTasksPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Nursing Tasks' }]} />
      <CNOTasksPanel />
    </div>
  );
}
