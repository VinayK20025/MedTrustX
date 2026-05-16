'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EvidenceMetadataPanel } from '@/modules/evidence-management';

export default function EvidenceMetadataRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Evidence Management' }, { label: 'AI-Enriched Metadata' }]} />
      <EvidenceMetadataPanel />
    </div>
  );
}
