'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TwinStatesPanel } from '@/modules/digital-twin';

export default function TwinStatesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Digital Twin Engine' }, { label: 'State Snapshots' }]} />
      <TwinStatesPanel />
    </div>
  );
}
