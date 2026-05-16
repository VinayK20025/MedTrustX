'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LitigationUpdatesPanel } from '@/modules/litigation-tracking';

export default function LitigationUpdatesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Litigation Tracking' }, { label: 'Timeline Updates' }]} />
      <LitigationUpdatesPanel />
    </div>
  );
}
