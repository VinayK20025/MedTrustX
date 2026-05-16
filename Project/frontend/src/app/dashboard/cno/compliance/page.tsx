'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CNOCompliancePanel } from '@/modules/cno';

export default function CNOCompliancePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CNO Command' }, { label: 'Missed Care & Compliance' }]} />
      <CNOCompliancePanel />
    </div>
  );
}
