'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { ICUDashboard } from '@/modules/icu';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function ICUOverviewRoute() {
  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <ICUDashboard />
    </RoleGuard>
  );
}
