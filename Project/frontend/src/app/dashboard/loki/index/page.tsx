'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LogIndexPanel } from '@/modules/loki';

export default function LokiIndexRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Loki Logging' }, { label: 'Label Index Registry' }]} />
      <LogIndexPanel />
    </div>
  );
}
