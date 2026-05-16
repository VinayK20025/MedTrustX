'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DeputyWardsPanel } from '@/modules/deputy-ms';

export default function DeputyWardsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Deputy MS' }, { label: 'Ward Rounds' }]} />
      <DeputyWardsPanel />
    </div>
  );
}
