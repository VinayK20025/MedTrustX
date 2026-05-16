'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WorkflowRunsPanel } from '@/modules/automation-rpa';

export default function RpaRunsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Automation & RPA Engine' }, { label: 'Execution History' }]} />
      <WorkflowRunsPanel />
    </div>
  );
}
