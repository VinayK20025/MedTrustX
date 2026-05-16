'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TransformationsPanel } from '@/modules/data-fabric';

export default function FabricTransformationsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Fabric & Integration Hub' }, { label: 'Schema Transformations' }]} />
      <TransformationsPanel />
    </div>
  );
}
