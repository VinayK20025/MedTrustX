'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CaseTasksPanel } from '@/modules/legal-case-management';

export default function LegalTasksRoute() {
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Legal Case Management' }, { label: 'Workflow Tasks' }]} />
      <CaseTasksPanel />
    </div>
  );
}
