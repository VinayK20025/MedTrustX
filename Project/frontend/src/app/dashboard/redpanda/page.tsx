'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RedpandaDashboard } from '@/modules/redpanda';

export default function RedpandaRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Streaming' }, { label: 'Redpanda Analytics' }]} />
      <RedpandaDashboard />
    </div>
  );
}
