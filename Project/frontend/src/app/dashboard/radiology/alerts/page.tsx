'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RadiologyAlertPanel, useRadiologyDashboard } from '@/modules/radiology';
import { Skeleton } from '@/components/ui/Spinner';

export default function RadiologyAlertsPage() {
  const { data, isLoading } = useRadiologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Critical Findings' }]} />
      <RadiologyAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
