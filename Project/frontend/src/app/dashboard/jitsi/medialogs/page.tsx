'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MediaLogsPanel } from '@/modules/jitsi';

export default function JitsiMediaLogsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jitsi Conferencing' }, { label: 'Media Analytics' }]} />
      <MediaLogsPanel />
    </div>
  );
}
