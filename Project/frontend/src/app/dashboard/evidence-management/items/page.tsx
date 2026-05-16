'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EvidenceItemsPanel } from '@/modules/evidence-management';

export default function EvidenceItemsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Evidence Management' }, { label: 'Evidence Registry' }]} />
      <EvidenceItemsPanel />
    </div>
  );
}
