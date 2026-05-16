'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResourcesPanel } from '@/modules/resource-optimization';

export default function ResOptResourcesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Resource Optimization Engine' }, { label: 'Resource Inventory' }]} />
      <ResourcesPanel />
    </div>
  );
}
