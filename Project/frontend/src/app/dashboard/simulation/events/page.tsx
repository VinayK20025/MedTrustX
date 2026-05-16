'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SimulationEventsPanel } from '@/modules/simulation';

export default function SimulationEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Simulation Engine' }, { label: 'Simulation Events' }]} />
      <SimulationEventsPanel />
    </div>
  );
}
