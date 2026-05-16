'use client';
import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ClinicalDashboard } from '@/modules/clinical';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function ClinicalRoute() {
  const setPageMeta = useUIStore((s) => s.setPageMeta);

  useEffect(() => {
    setPageMeta('Clinical', 'Clinical documentation workspace');
  }, [setPageMeta]);

  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-4 animate-fade-in">
        <Breadcrumbs items={[{ label: 'Clinical' }]} />
        <ClinicalDashboard />
      </div>
    </RoleGuard>
  );
}
