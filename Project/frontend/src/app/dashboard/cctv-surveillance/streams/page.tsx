'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VideoStreamsPanel } from '@/modules/cctv-surveillance';

export default function CCTVStreamsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CCTV & Surveillance' }, { label: 'Live Streams' }]} />
      <VideoStreamsPanel />
    </div>
  );
}
