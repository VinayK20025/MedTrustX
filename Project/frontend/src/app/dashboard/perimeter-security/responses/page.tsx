'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ResponseActionsPanel } from '@/modules/perimeter-security';

export default function PerimeterResponsesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Perimeter Security' }, { label: 'Response Actions' }]} />
      <ResponseActionsPanel />
    </div>
  );
}
