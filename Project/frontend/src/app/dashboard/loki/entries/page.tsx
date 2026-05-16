'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LogEntriesPanel } from '@/modules/loki';

export default function LokiEntriesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Loki Logging' }, { label: 'Live Log Tail' }]} />
      <LogEntriesPanel />
    </div>
  );
}
