'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AlertsPanel } from '@/modules/alert-correlation';

export default function RawAlertsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Alert Correlation Engine' }, { label: 'Raw Alerts' }]} />
      <AlertsPanel />
    </div>
  );
}
