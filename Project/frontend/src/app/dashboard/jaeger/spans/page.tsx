'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SpansPanel } from '@/modules/jaeger';

export default function JaegerSpansRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jaeger Tracing' }, { label: 'Span Waterfall' }]} />
      <SpansPanel />
    </div>
  );
}
