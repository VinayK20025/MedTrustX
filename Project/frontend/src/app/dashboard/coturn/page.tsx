'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CoturnDashboard } from '@/modules/coturn';

export default function CoturnRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Coturn Relay' }]} />
      <CoturnDashboard />
    </div>
  );
}
