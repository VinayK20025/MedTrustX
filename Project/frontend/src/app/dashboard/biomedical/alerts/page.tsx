'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BiomedicalAlertPanel, useBiomedicalDashboard } from '@/modules/biomedical';
import { Skeleton } from '@/components/ui/Spinner';

export default function BiomedicalAlertsPage() {
  const { data, isLoading } = useBiomedicalDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Device Alerts' }]} />
      <BiomedicalAlertPanel alerts={data?.data?.alerts ?? []} />
    </div>
  );
}
