'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ConferenceRoomsPanel } from '@/modules/jitsi';

export default function JitsiRoomsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jitsi Conferencing' }, { label: 'Conference Rooms' }]} />
      <ConferenceRoomsPanel />
    </div>
  );
}
