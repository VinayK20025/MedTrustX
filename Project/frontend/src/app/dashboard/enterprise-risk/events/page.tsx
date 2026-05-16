'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RiskEventsPanel } from '@/modules/enterprise-risk';

export default function EventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Enterprise Risk' }, { label: 'Risk Events & Audits' }]} />
      <RiskEventsPanel />
    </div>
  );
}
