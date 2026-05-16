'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PanelsPanel } from '@/modules/grafana';

export default function GrafanaPanelsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Grafana Visualization' }, { label: 'Panels' }]} />
      <PanelsPanel />
    </div>
  );
}
