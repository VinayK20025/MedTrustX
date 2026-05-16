'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AssetsPanel } from '@/modules/asset-tracking';

export default function RTLSAssetsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Asset Tracking' }, { label: 'Tracked Assets' }]} />
      <AssetsPanel />
    </div>
  );
}
