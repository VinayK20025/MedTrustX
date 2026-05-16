'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SimulationResultsPanel } from '@/modules/simulation';

export default function SimulationResultsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Simulation Engine' }, { label: 'Simulation Outcomes' }]} />
      <SimulationResultsPanel />
    </div>
  );
}
