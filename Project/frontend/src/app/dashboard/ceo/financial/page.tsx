'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FinancialOverviewPanel } from '@/modules/ceo';

export default function FinancialOverviewPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CEO View' }, { label: 'Financial Performance' }]} />
      <FinancialOverviewPanel />
    </div>
  );
}
