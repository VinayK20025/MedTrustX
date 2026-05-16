'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SimulationsPanel } from '@/modules/simulation';

export default function SimulationRunsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Simulation Engine' }, { label: 'Simulation Runs' }]} />
      <SimulationsPanel />
    </div>
  );
}
