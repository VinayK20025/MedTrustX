'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ICUAlertsWorkPanel } from '@/modules/intensivist';

export default function ICUAlertsWorkPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Alerts' }]} />
      <ICUAlertsWorkPanel />
    </div>
  );
}
