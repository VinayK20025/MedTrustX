'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ApiCompositionsPanel } from '@/modules/api-composition';

export default function ApiDefinitionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'API Composition Gateway' }, { label: 'Compositions Registry' }]} />
      <ApiCompositionsPanel />
    </div>
  );
}
