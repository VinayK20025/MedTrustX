'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LegalPartiesPanel } from '@/modules/litigation-tracking';

export default function LitigationPartiesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Litigation Tracking' }, { label: 'Legal Parties' }]} />
      <LegalPartiesPanel />
    </div>
  );
}
