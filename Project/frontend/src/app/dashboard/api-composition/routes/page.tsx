'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CompositionRoutesPanel } from '@/modules/api-composition';

export default function ApiRoutesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'API Composition Gateway' }, { label: 'Route Map' }]} />
      <CompositionRoutesPanel />
    </div>
  );
}
