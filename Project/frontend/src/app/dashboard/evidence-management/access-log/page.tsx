'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AccessRecordsPanel } from '@/modules/evidence-management';

export default function EvidenceAccessLogRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Evidence Management' }, { label: 'Access Audit Log' }]} />
      <AccessRecordsPanel />
    </div>
  );
}
