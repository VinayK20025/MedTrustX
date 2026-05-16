'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CorrelatedIncidentsPanel } from '@/modules/alert-correlation';

export default function CorrelatedIncidentsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Alert Correlation Engine' }, { label: 'Correlated Incidents' }]} />
      <CorrelatedIncidentsPanel />
    </div>
  );
}
