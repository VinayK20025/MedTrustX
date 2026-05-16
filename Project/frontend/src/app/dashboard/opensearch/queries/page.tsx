'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SearchQueriesPanel } from '@/modules/opensearch';

export default function OpenSearchQueriesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OpenSearch Service' }, { label: 'Search Queries' }]} />
      <SearchQueriesPanel />
    </div>
  );
}
