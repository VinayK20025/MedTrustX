'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PathologistAlertPanel, usePathologistDashboard } from '@/modules/pathologist';
import { Skeleton } from '@/components/ui/Spinner';

export default function PathologistAlertsPage() {
  const { data, isLoading } = usePathologistDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Critical Alerts' }]} />
      <PathologistAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
