'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IotDashboard } from '@/modules/iot';

export default function IotRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Edge & Devices' }, { label: 'IoT Messaging (EMQX)' }]} />
      <IotDashboard />
    </div>
  );
}
