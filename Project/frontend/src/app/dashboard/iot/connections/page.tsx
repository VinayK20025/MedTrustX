'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConnectionsPanel } from '@/modules/iot';

export default function IotConnectionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'IoT Messaging' }, { label: 'Device Connections' }]} />
      <ConnectionsPanel />
    </div>
  );
}
