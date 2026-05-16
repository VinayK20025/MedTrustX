'use client';
import React from 'react';
import { RoleGuard } from '@/components/guards/AuthGuard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdminBedManagementPanel, useAdminDashboard } from '@/modules/hospital-admin';
import { Skeleton } from '@/components/ui/Spinner';

const HOSPITAL_ADMIN_ROLES = ['hospital_admin', 'super_admin'];

export default function AdminBedsPage() {
  const { data, isLoading } = useAdminDashboard({});

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <RoleGuard roles={HOSPITAL_ADMIN_ROLES}>
      <div className="space-y-6 animate-fade-in max-w-[1800px]">
        <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Hospital Bed Management' }]} />
        <div className="h-[600px]">
          <AdminBedManagementPanel beds={data?.data?.bedOccupancy ?? []} />
        </div>
      </div>
    </RoleGuard>
  );
}
