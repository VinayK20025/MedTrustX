'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TracesPanel } from '@/modules/jaeger';

export default function JaegerTracesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jaeger Tracing' }, { label: 'Distributed Traces' }]} />
      <TracesPanel />
    </div>
  );
}
