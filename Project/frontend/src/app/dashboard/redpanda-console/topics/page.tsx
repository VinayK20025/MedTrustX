'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TopicViewsPanel } from '@/modules/redpanda-console';

export default function RedpandaTopicsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Redpanda Console' }, { label: 'Topic Inspections' }]} />
      <TopicViewsPanel />
    </div>
  );
}
