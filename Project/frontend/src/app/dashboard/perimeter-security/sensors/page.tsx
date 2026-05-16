'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SensorsPanel } from '@/modules/perimeter-security';

export default function PerimeterSensorsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Perimeter Security' }, { label: 'Boundary Sensors' }]} />
      <SensorsPanel />
    </div>
  );
}
