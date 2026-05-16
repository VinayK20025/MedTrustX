'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { VisitorManagementDashboard } from '@/modules/visitor-management';

export default function VisitorManagementRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Operations' }, { label: 'Visitor Management' }]} />
      <VisitorManagementDashboard />
    </div>
  );
}
