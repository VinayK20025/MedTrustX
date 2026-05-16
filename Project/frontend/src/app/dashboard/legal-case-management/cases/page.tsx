'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LegalCasesPanel } from '@/modules/legal-case-management';

export default function LegalCasesRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Case Management' }, { label: 'Case Registry' }]} />
      <LegalCasesPanel />
    </div>
  );
}
