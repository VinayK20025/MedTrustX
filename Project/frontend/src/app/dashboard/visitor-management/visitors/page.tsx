'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VisitorsPanel } from '@/modules/visitor-management';

export default function VisitorRegistryRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visitor Management' }, { label: 'Visitor Registry' }]} />
      <VisitorsPanel />
    </div>
  );
}
