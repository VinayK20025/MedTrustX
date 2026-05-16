'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CommandCenterDashboard } from '@/modules/command-center';

export default function CommandCenterRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Infrastructure' }, { label: 'Operational Command Center' }]} />
      <CommandCenterDashboard />
    </div>
  );
}
