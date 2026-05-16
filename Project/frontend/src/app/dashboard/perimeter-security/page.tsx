'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PerimeterSecurityDashboard } from '@/modules/perimeter-security';

export default function PerimeterSecurityRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Perimeter Security' }]} />
      <PerimeterSecurityDashboard />
    </div>
  );
}
