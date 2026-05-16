'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMORiskPanel } from '@/modules/cmo';

export default function CMORiskPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'High-Risk Monitoring' }]} />
      <CMORiskPanel />
    </div>
  );
}
