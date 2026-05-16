'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CommandsPanel } from '@/modules/iot';

export default function IotCommandsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'IoT Messaging' }, { label: 'Device Commands' }]} />
      <CommandsPanel />
    </div>
  );
}
