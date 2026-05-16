'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { StreamTopicsPanel } from '@/modules/redpanda';

export default function RedpandaTopicsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Analytics' }, { label: 'Stream Topics' }]} />
      <StreamTopicsPanel />
    </div>
  );
}
