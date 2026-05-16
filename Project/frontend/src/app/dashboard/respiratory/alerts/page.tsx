'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RespiratoryAlertPanel, useRespiratoryDashboard } from '@/modules/respiratory';
import { Skeleton } from '@/components/ui/Spinner';

export default function RespiratoryAlertsPage() {
  const { data, isLoading } = useRespiratoryDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Respiratory' }, { label: 'Critical Alarms' }]} />
      <RespiratoryAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
