'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhysicalAccessDashboard } from '@/modules/physical-access';

export default function PhysicalAccessRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'Physical Access Control' }]} />
      <PhysicalAccessDashboard />
    </div>
  );
}
