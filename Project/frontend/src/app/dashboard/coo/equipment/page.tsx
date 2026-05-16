'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { COOEquipmentPanel } from '@/modules/coo';

export default function COOEquipmentPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'COO Command' }, { label: 'Equipment Status' }]} />
      <COOEquipmentPanel />
    </div>
  );
}
