'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DashboardsPanel } from '@/modules/grafana';

export default function GrafanaDashboardsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Grafana Visualization' }, { label: 'Dashboards Registry' }]} />
      <DashboardsPanel />
    </div>
  );
}
