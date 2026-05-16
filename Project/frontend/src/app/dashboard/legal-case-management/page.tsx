'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LegalCaseManagementDashboard } from '@/modules/legal-case-management';

export default function LegalCaseManagementRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal' }, { label: 'Case Management' }]} />
      <LegalCaseManagementDashboard />
    </div>
  );
}
