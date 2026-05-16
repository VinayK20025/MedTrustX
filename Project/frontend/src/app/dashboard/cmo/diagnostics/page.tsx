'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CMODiagnosticsPanel } from '@/modules/cmo';

export default function CMODiagnosticsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CMO Governance' }, { label: 'Diagnostics' }]} />
      <CMODiagnosticsPanel />
    </div>
  );
}
