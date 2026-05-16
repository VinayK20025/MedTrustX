'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuppressionRulesPanel } from '@/modules/alert-correlation';

export default function SuppressionRulesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Alert Correlation Engine' }, { label: 'Suppression Rules' }]} />
      <SuppressionRulesPanel />
    </div>
  );
}
