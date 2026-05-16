'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { DiagnosticsDashboard } from '@/modules/diagnostics';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function DiagnosticsRoute() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);

  useEffect(() => {
    setPageMeta('Diagnostics', 'Lab and imaging workflows');
  }, [setPageMeta]);

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-4 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Diagnostics' }]} />
        <DiagnosticsDashboard />
      </div>
    </RoleGuard>
  );
}
