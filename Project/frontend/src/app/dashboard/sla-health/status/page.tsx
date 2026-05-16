'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ServiceHealthPanel } from '@/modules/sla-health';

export default function ServiceHealthStatusRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SLA & Service Health' }, { label: 'Service Health Status' }]} />
      <ServiceHealthPanel />
    </div>
  );
}
