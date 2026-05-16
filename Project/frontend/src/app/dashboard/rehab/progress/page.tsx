'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RehabProgressPanel, useRehabDashboard } from '@/modules/rehab';
import { Skeleton } from '@/components/ui/Spinner';

export default function RehabProgressPage() {
  const { data, isLoading } = useRehabDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Rehabilitation' }, { label: 'Progress Tracking' }]} />
      <RehabProgressPanel metrics={data?.data?.progressMetrics ?? []} />
    </div>
  );
}
