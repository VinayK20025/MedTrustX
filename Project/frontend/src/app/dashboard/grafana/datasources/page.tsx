'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DataSourcesPanel } from '@/modules/grafana';

export default function GrafanaDataSourcesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Grafana Visualization' }, { label: 'Data Sources' }]} />
      <DataSourcesPanel />
    </div>
  );
}
