'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CCTVSurveillanceDashboard } from '@/modules/cctv-surveillance';

export default function CCTVSurveillanceRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Security' }, { label: 'CCTV & Surveillance' }]} />
      <CCTVSurveillanceDashboard />
    </div>
  );
}
