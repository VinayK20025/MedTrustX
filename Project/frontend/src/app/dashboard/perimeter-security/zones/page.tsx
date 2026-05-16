'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PerimeterZonesPanel } from '@/modules/perimeter-security';

export default function PerimeterZonesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Perimeter Security' }, { label: 'Boundary Zones' }]} />
      <PerimeterZonesPanel />
    </div>
  );
}
