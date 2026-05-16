'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RadiologyTechAlertPanel, useRadiologyTechDashboard } from '@/modules/radiology-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function RadiologyTechAlertsPage() {
  const { data, isLoading } = useRadiologyTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Scanner Alerts' }]} />
      <RadiologyTechAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
