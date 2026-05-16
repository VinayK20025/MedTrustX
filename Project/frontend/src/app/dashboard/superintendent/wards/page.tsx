'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperWardsPanel } from '@/modules/superintendent';

export default function SuperWardsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Ward Management' }]} />
      <SuperWardsPanel />
    </div>
  );
}
