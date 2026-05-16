'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RedpandaConsoleDashboard } from '@/modules/redpanda-console';

export default function RedpandaConsoleRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Redpanda Console' }]} />
      <RedpandaConsoleDashboard />
    </div>
  );
}
