'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LogStreamsPanel } from '@/modules/loki';

export default function LokiStreamsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Loki Logging' }, { label: 'Log Streams' }]} />
      <LogStreamsPanel />
    </div>
  );
}
