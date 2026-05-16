'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ObjectivesList } from '@/modules/strategic-planning';

export default function ObjectivesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Strategic Planning' }, { label: 'Objectives' }]} />
      <ObjectivesList />
    </div>
  );
}
