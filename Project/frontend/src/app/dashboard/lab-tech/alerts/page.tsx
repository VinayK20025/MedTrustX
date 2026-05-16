'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LabTechAlertPanel, useLabTechDashboard } from '@/modules/lab-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function LabTechAlertsPage() {
  const { data, isLoading } = useLabTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Workflow Alerts' }]} />
      <LabTechAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
