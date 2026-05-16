'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ControlSessionsPanel } from '@/modules/command-center';

export default function CmdSessionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operational Command Center' }, { label: 'Operator Sessions' }]} />
      <ControlSessionsPanel />
    </div>
  );
}
