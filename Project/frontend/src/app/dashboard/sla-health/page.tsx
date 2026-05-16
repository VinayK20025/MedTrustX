'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SlaHealthDashboard } from '@/modules/sla-health';

export default function SlaHealthRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'SLA & Service Health' }]} />
      <SlaHealthDashboard />
    </div>
  );
}
