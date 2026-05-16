'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { UltrasoundLivePanel, useUltrasoundDashboard } from '@/modules/ultrasound';
import { Skeleton } from '@/components/ui/Spinner';

export default function UltrasoundScanningPage() {
  const { data, isLoading } = useUltrasoundDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  if (!data?.data?.liveState) return <div>No live state available</div>;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Live Scanning' }]} />
      <UltrasoundLivePanel activePatient={data?.data?.activePatient} liveState={data.data.liveState} />
    </div>
  );
}
