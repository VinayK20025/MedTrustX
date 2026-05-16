'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VisitsPanel } from '@/modules/visitor-management';

export default function VisitorVisitsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visitor Management' }, { label: 'Visit Schedule' }]} />
      <VisitsPanel />
    </div>
  );
}
