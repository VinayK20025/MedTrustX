'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RpaDashboard } from '@/modules/automation-rpa';

export default function RpaEngineRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Automation & RPA Engine' }]} />
      <RpaDashboard />
    </div>
  );
}
