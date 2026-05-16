'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RecommendationsPanel } from '@/modules/intensivist';

export default function RecommendationsPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Recommendations' }]} />
      <RecommendationsPanel caseId="" />
    </div>
  );
}
