'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LitigationCasesPanel } from '@/modules/litigation-tracking';

export default function LitigationCasesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Litigation Tracking' }, { label: 'Active Cases' }]} />
      <LitigationCasesPanel />
    </div>
  );
}
