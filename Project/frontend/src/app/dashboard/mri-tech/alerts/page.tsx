'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MriTechAlertPanel, useMriTechDashboard } from '@/modules/mri-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function MriTechAlertsPage() {
  const { data, isLoading } = useMriTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Safety Alerts' }]} />
      <MriTechAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
