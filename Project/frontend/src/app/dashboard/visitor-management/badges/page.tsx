'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BadgesPanel } from '@/modules/visitor-management';

export default function VisitorBadgesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visitor Management' }, { label: 'Visitor Badges' }]} />
      <BadgesPanel />
    </div>
  );
}
