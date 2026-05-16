'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { InitiativesList } from '@/modules/strategic-planning';

export default function InitiativesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Strategic Planning' }, { label: 'Execution Initiatives' }]} />
      <InitiativesList />
    </div>
  );
}
