'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HrStaffDirectory, useHrDashboard } from '@/modules/hr';
import { Skeleton } from '@/components/ui/Spinner';

const HR_ROLES = ['hr_manager', 'super_admin', 'hospital_admin', 'hr_executive'];

export default function HrStaffPage() {
  const { data, isLoading } = useHrDashboard({});
  if (isLoading) return <RoleGuard roles={HR_ROLES}><Skeleton className="h-[600px] w-full rounded-xl" /></RoleGuard>;
  return (
    <RoleGuard roles={HR_ROLES}>
      <div className="space-y-5 animate-fade-in max-w-[800px]">
        <Breadcrumbs items={[{ label: 'HR' }, { label: 'Staff Directory' }]} />
        <div className="h-[700px]"><HrStaffDirectory staff={data?.data?.staffDirectory ?? []} /></div>
      </div>
    </RoleGuard>
  );
}
