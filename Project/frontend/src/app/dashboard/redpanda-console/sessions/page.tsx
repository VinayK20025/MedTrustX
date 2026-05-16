'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConsoleSessionsPanel } from '@/modules/redpanda-console';

export default function RedpandaSessionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Console' }, { label: 'Operator Sessions' }]} />
      <ConsoleSessionsPanel />
    </div>
  );
}
