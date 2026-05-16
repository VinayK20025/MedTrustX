'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LinkMetricsPanel } from '@/modules/edge-connectivity';

export default function EdgeLinkMetricsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Edge Connectivity' }, { label: 'Link Health Metrics' }]} />
      <LinkMetricsPanel />
    </div>
  );
}
