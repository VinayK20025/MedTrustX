'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyTasksPanel } from '@/modules/deputy-ms';

export default function DeputyTasksPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Pending Tasks' }]} />
      <DeputyTasksPanel />
    </div>
  );
}
