'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CommandsPanel } from '@/modules/command-center';

export default function CmdActionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operational Command Center' }, { label: 'Dispatched Commands' }]} />
      <CommandsPanel />
    </div>
  );
}
