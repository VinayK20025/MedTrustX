'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DataFabricDashboard } from '@/modules/data-fabric';

export default function DataFabricRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Data Fabric & Integration Hub' }]} />
      <DataFabricDashboard />
    </div>
  );
}
