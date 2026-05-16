'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTChecklistPanel } from '@/modules/nurse';

export default function OTChecklistPanelRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Nurse' }, { label: 'Post-Op Checklist' }]} />
      <OTChecklistPanel phase="Post-Op" />
    </div>
  );
}
