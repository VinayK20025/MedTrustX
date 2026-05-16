'use client';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { DiagnosticsDashboard } from '@/modules/diagnostics';

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Visiting Intensivist' }, { label: 'Diagnostics' }]} />
      <DiagnosticsDashboard roleTitle="Visiting Intensivist" isQualityView={false} />
    </div>
  );
}
