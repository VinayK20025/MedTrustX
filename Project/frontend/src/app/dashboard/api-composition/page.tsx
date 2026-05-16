'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ApiCompositionDashboard } from '@/modules/api-composition';

export default function ApiCompositionRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'API Composition Gateway' }]} />
      <ApiCompositionDashboard />
    </div>
  );
}
