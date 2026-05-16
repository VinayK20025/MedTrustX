'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CareCoordinatorPatientList, useCareCoordinatorDashboard } from '@/modules/care-coordinator';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { CLINICAL_ROLES } from '@/utils/permissions';

export default function CareCoordinatorPatientsPage() {
  const { data, isLoading } = useCareCoordinatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <RoleGuard roles={CLINICAL_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Care Coordination' }, { label: 'Active Patients' }]} />
        <CareCoordinatorPatientList patients={data?.data?.patients ?? []} />
      </div>
    </RoleGuard>
  );
}
