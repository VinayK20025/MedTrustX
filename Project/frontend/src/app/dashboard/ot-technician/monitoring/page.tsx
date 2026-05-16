'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { OTTechMonitoringPanel, useOTTechDashboard } from '@/modules/ot-technician';
import { Skeleton } from '@/components/ui/Spinner';

export default function OTTechMonitoringPage() {
  const { data, isLoading } = useOTTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Live Telemetry' }]} />
      <OTTechMonitoringPanel telemetry={data?.data?.liveTelemetry ?? []} devices={data?.data?.devices ?? []} />
    </div>
  );
}
