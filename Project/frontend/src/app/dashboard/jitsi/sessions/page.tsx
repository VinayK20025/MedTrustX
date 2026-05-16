'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConferenceSessionsPanel } from '@/modules/jitsi';

export default function JitsiSessionsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jitsi Conferencing' }, { label: 'Meeting Sessions' }]} />
      <ConferenceSessionsPanel />
    </div>
  );
}
