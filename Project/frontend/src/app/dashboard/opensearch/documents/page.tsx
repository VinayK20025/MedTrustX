'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { IndexedDocumentsPanel } from '@/modules/opensearch';

export default function OpenSearchDocumentsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OpenSearch Service' }, { label: 'Indexed Documents' }]} />
      <IndexedDocumentsPanel />
    </div>
  );
}
