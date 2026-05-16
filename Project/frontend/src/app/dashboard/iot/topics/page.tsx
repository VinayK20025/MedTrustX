'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TopicsPanel } from '@/modules/iot';

export default function IotTopicsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'IoT Messaging' }, { label: 'MQTT Topics' }]} />
      <TopicsPanel />
    </div>
  );
}
