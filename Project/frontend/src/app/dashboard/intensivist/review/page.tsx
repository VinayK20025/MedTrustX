'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUCaseReviewPanel } from '@/modules/intensivist';

export default function ICUCaseReviewPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Case Notes' }]} />
      <ICUCaseReviewPanel />
    </div>
  );
}
