'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOOTPanel } from '@/modules/coo';

export default function COOOTPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'OT Management' }]} />
      <COOOTPanel />
    </div>
  );
}
