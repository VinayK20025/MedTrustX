'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CNOVitalsPanel } from '@/modules/cno';

export default function CNOVitalsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Vitals Monitoring' }]} />
      <CNOVitalsPanel />
    </div>
  );
}
