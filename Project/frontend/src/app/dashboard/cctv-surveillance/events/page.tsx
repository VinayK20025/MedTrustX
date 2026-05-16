'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SurveillanceEventsPanel } from '@/modules/cctv-surveillance';

export default function CCTVEventsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CCTV & Surveillance' }, { label: 'AI Detection Events' }]} />
      <SurveillanceEventsPanel />
    </div>
  );
}
