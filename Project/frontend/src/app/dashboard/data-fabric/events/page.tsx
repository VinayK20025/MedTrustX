'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IntegrationEventsPanel } from '@/modules/data-fabric';

export default function FabricEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Fabric & Integration Hub' }, { label: 'Telemetry Events' }]} />
      <IntegrationEventsPanel />
    </div>
  );
}
