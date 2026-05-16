'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdminDepartmentPerformancePanel, useAdminDashboard } from '@/modules/hospital-admin';
import { Skeleton } from '@/components/ui/Spinner';

export default function AdminDepartmentsPage() {
  const { data, isLoading } = useAdminDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Department Performance' }]} />
      <div className="h-[600px]">
        <AdminDepartmentPerformancePanel departments={data?.data?.departments ?? []} />
      </div>
    </div>
  );
}
