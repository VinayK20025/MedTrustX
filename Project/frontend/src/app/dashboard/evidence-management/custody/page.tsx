'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CustodyLogPanel } from '@/modules/evidence-management';

export default function EvidenceCustodyRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Evidence Management' }, { label: 'Chain of Custody' }]} />
      <CustodyLogPanel />
    </div>
  );
}
