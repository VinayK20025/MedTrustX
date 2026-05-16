'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DependencyMapPanel } from '@/modules/network-observability';

export default function NetworkDependenciesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Network Observability' }, { label: 'Service Dependencies' }]} />
      <DependencyMapPanel />
    </div>
  );
}
