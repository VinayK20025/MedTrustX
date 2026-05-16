'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CaseDocumentsPanel } from '@/modules/legal-case-management';

export default function LegalDocumentsRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Case Management' }, { label: 'Case Documents' }]} />
      <CaseDocumentsPanel />
    </div>
  );
}
