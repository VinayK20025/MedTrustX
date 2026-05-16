'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CamerasPanel } from '@/modules/cctv-surveillance';

export default function CCTVCamerasRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'CCTV & Surveillance' }, { label: 'Camera Fleet' }]} />
      <CamerasPanel />
    </div>
  );
}
