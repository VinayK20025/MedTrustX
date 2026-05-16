'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperOTPanel } from '@/modules/superintendent';

export default function SuperOTPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'OT Coordination' }]} />
      <SuperOTPanel />
    </div>
  );
}
