'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AlertVisualizationsPanel } from '@/modules/grafana';

export default function GrafanaAlertsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Grafana Visualization' }, { label: 'Alert Panel Mappings' }]} />
      <AlertVisualizationsPanel />
    </div>
  );
}
