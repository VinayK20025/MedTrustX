'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyAlertsPanel } from '@/modules/deputy-ms';

export default function DeputyAlertsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Active Alerts' }]} />
      <DeputyAlertsPanel />
    </div>
  );
}
