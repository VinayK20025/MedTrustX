'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RelayUsageLogsPanel } from '@/modules/coturn';

export default function CoturnUsageLogsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Coturn Relay' }, { label: 'Usage Logs' }]} />
      <RelayUsageLogsPanel />
    </div>
  );
}
