'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JaegerDashboard } from '@/modules/jaeger';

export default function JaegerRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Observability' }, { label: 'Jaeger Distributed Tracing' }]} />
      <JaegerDashboard />
    </div>
  );
}
