'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AllocationsPanel } from '@/modules/resource-optimization';

export default function ResOptAllocationsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Resource Optimization Engine' }, { label: 'Active Allocations' }]} />
      <AllocationsPanel />
    </div>
  );
}
