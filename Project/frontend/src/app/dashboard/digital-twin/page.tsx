'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DigitalTwinDashboard } from '@/modules/digital-twin';

export default function DigitalTwinRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Digital Twin Engine' }]} />
      <DigitalTwinDashboard />
    </div>
  );
}
