'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MessagesPanel } from '@/modules/iot';

export default function IotMessagesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'IoT Messaging' }, { label: 'Telemetry Stream' }]} />
      <MessagesPanel />
    </div>
  );
}
