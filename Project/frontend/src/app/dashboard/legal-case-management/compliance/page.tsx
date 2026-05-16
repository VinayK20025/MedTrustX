'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ComplianceRecordsPanel } from '@/modules/legal-case-management';

export default function LegalComplianceRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Case Management' }, { label: 'Regulatory Compliance' }]} />
      <ComplianceRecordsPanel />
    </div>
  );
}
