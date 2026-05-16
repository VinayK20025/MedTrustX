'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LokiDashboard } from '@/modules/loki';

export default function LokiRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Observability' }, { label: 'Loki Log Aggregation' }]} />
      <LokiDashboard />
    </div>
  );
}
