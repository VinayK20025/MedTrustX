'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BoardCompliancePanel } from '@/modules/board';

export default function BoardCompliancePanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Board of Directors' }, { label: 'Regulatory Compliance' }]} />
      <BoardCompliancePanel />
    </div>
  );
}
