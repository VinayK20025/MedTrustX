'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SlaViolationsPanel } from '@/modules/sla-health';

export default function SlaViolationsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'SLA & Service Health' }, { label: 'SLA Violations' }]} />
      <SlaViolationsPanel />
    </div>
  );
}
