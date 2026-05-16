'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BiomedicalMonitoringPanel, useBiomedicalDashboard } from '@/modules/biomedical';
import { Skeleton } from '@/components/ui/Spinner';

export default function BiomedicalMonitoringPage() {
  const { data, isLoading } = useBiomedicalDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Device Telemetry' }]} />
      <BiomedicalMonitoringPanel telemetry={data?.data?.telemetry ?? []} devices={data?.data?.inventory ?? []} />
    </div>
  );
}
