'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StreamMessagesPanel } from '@/modules/redpanda';

export default function RedpandaMessagesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Analytics' }, { label: 'Stream Messages' }]} />
      <StreamMessagesPanel />
    </div>
  );
}
