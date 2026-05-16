'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperTasksPanel } from '@/modules/superintendent';

export default function SuperTasksPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Task Management' }]} />
      <SuperTasksPanel />
    </div>
  );
}
