'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { GrafanaDashboard } from '@/modules/grafana';

export default function GrafanaRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Observability' }, { label: 'Grafana Visualization' }]} />
      <GrafanaDashboard />
    </div>
  );
}
