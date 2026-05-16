'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SlaDefinitionsPanel } from '@/modules/sla-health';

export default function SlaDefinitionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SLA & Service Health' }, { label: 'SLA Definitions' }]} />
      <SlaDefinitionsPanel />
    </div>
  );
}
