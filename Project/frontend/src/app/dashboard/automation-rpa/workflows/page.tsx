'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { WorkflowsPanel } from '@/modules/automation-rpa';

export default function RpaWorkflowsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Automation & RPA Engine' }, { label: 'Automated Workflows' }]} />
      <WorkflowsPanel />
    </div>
  );
}
