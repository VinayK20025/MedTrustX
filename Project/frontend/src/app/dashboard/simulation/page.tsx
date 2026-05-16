'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SimulationDashboard } from '@/modules/simulation';

export default function SimulationRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Intelligence' }, { label: 'Simulation & What-If Engine' }]} />
      <SimulationDashboard />
    </div>
  );
}
