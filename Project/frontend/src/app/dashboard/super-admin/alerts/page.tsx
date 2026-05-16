'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SuperAdminAlertPanel, useSuperAdminDashboard } from '@/modules/super-admin';
import { Skeleton } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/guards/AuthGuard';

export default function SuperAdminAlertsPage() {
  const { data, isLoading } = useSuperAdminDashboard({});

  if (isLoading) return <div className="space-y-6 animate-fade-in max-w-[1600px]"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;

  return (
    <RoleGuard roles={['super_admin', 'ceo', 'enterprise-root']} requireAll={false}>
      <div className="space-y-5 animate-fade-in max-w-[1600px]">
        <Breadcrumbs items={[{ label: 'Administration' }, { label: 'Global Alerts' }]} />
        <SuperAdminAlertPanel alerts={data?.data?.alerts ?? []} />
      </div>
    </RoleGuard>
  );
}
