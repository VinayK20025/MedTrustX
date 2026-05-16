'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AdminAlertsPanel, useAdminDashboard } from '@/modules/hospital-admin';
import { Skeleton } from '@/components/ui/Spinner';

export default function AdminCompliancePage() {
  const { data, isLoading } = useAdminDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-6 animate-fade-in max-w-[1800px]">
      <Breadcrumbs items={[{ label: 'Executive' }, { label: 'Compliance & Incidents' }]} />
      <div className="h-[600px]">
        <AdminAlertsPanel alerts={data?.data?.alerts ?? []} />
      </div>
    </div>
  );
}
