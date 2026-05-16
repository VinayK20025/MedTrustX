'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ForecastPanel } from '@/modules/strategic-planning';

export default function ForecastsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Strategic Planning' }, { label: 'Strategic Forecasts' }]} />
      <ForecastPanel />
    </div>
  );
}
