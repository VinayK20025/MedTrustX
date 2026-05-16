'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperAlertsPanel } from '@/modules/superintendent';

export default function SuperAlertsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Critical Alerts' }]} />
      <SuperAlertsPanel />
    </div>
  );
}
