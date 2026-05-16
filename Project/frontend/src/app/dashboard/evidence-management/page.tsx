'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EvidenceManagementDashboard } from '@/modules/evidence-management';

export default function EvidenceManagementRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Evidence Management' }]} />
      <EvidenceManagementDashboard />
    </div>
  );
}
