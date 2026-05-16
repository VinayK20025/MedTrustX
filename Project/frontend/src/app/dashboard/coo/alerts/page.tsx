'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOAlertsPanel } from '@/modules/coo';

export default function COOAlertsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Bottlenecks & Alerts' }]} />
      <COOAlertsPanel />
    </div>
  );
}
