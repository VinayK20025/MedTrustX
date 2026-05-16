'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OpenSearchDashboard } from '@/modules/opensearch';

export default function OpenSearchRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'OpenSearch Service' }]} />
      <OpenSearchDashboard />
    </div>
  );
}
