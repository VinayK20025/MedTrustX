'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AlertCorrelationDashboard } from '@/modules/alert-correlation';

export default function AlertCorrelationRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Alert Correlation Engine' }]} />
      <AlertCorrelationDashboard />
    </div>
  );
}
