'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RecordingsPanel } from '@/modules/cctv-surveillance';

export default function CCTVRecordingsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CCTV & Surveillance' }, { label: 'Archived Recordings' }]} />
      <RecordingsPanel />
    </div>
  );
}
