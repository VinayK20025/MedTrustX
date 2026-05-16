'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JitsiDashboard } from '@/modules/jitsi';

export default function JitsiRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Communication Services' }, { label: 'Jitsi Conferencing' }]} />
      <JitsiDashboard />
    </div>
  );
}
