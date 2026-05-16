'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CEOClinicalPanel } from '@/modules/ceo';

export default function CEOClinicalPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Clinical Performance' }]} />
      <CEOClinicalPanel />
    </div>
  );
}
