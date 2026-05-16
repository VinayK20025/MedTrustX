'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeviceMetricsPanel } from '@/modules/network-management';

export default function NetMgmtMetricsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Management' }, { label: 'Device Telemetry' }]} />
      <DeviceMetricsPanel />
    </div>
  );
}
