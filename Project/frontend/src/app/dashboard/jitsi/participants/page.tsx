'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ParticipantsPanel } from '@/modules/jitsi';

export default function JitsiParticipantsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Jitsi Conferencing' }, { label: 'Active Participants' }]} />
      <ParticipantsPanel />
    </div>
  );
}
