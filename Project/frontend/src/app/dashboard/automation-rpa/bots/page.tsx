'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BotsPanel } from '@/modules/automation-rpa';

export default function RpaBotsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Automation & RPA Engine' }, { label: 'RPA Bot Fleet' }]} />
      <BotsPanel />
    </div>
  );
}
