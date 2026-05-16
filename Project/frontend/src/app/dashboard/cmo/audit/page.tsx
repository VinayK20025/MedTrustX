'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMOAuditPanel } from '@/modules/cmo';

export default function CMOAuditPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Case Audits' }]} />
      <CMOAuditPanel />
    </div>
  );
}
