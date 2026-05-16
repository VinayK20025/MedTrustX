'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperStaffPanel } from '@/modules/superintendent';

export default function SuperStaffPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Superintendent' }, { label: 'Staff Coordination' }]} />
      <SuperStaffPanel />
    </div>
  );
}
