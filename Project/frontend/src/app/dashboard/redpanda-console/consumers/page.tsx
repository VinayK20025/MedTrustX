'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConsumerGroupViewsPanel } from '@/modules/redpanda-console';

export default function RedpandaConsumersRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Console' }, { label: 'Consumer Group Lag' }]} />
      <ConsumerGroupViewsPanel />
    </div>
  );
}
