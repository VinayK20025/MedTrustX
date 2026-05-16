'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TasksPanel } from '@/modules/automation-rpa';

export default function RpaTasksRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Automation & RPA Engine' }, { label: 'Task Execution Trace' }]} />
      <TasksPanel />
    </div>
  );
}
