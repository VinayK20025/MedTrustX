'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConsumerOffsetsPanel } from '@/modules/redpanda';

export default function RedpandaOffsetsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Analytics' }, { label: 'Consumer Offsets' }]} />
      <ConsumerOffsetsPanel />
    </div>
  );
}
