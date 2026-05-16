'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TagsPanel } from '@/modules/asset-tracking';

export default function RTLSTagsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Asset Tracking' }, { label: 'RTLS Tags' }]} />
      <TagsPanel />
    </div>
  );
}
