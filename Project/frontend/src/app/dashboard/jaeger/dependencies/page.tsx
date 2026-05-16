'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DependenciesPanel } from '@/modules/jaeger';

export default function JaegerDependenciesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jaeger Tracing' }, { label: 'Service Dependency Topology' }]} />
      <DependenciesPanel />
    </div>
  );
}
