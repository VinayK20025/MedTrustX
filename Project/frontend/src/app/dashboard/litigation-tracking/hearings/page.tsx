'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HearingsPanel } from '@/modules/litigation-tracking';

export default function LitigationHearingsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Litigation Tracking' }, { label: 'Hearings Schedule' }]} />
      <HearingsPanel />
    </div>
  );
}
