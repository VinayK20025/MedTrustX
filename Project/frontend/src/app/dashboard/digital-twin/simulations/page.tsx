'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TwinSimulationsPanel } from '@/modules/digital-twin';

export default function TwinSimulationsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Digital Twin Engine' }, { label: 'Predictive Modelling' }]} />
      <TwinSimulationsPanel />
    </div>
  );
}
