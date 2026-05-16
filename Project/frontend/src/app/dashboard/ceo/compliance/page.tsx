'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CEOCompliancePanel } from '@/modules/ceo';

export default function CEOCompliancePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Risk & Compliance' }]} />
      <CEOCompliancePanel />
    </div>
  );
}
