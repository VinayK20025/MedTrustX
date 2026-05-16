'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScenariosPanel } from '@/modules/simulation';

export default function ScenariosRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Simulation Engine' }, { label: 'Scenario Parameters' }]} />
      <ScenariosPanel />
    </div>
  );
}
