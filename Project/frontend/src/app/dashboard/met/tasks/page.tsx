'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MetTaskQueue, useMetDashboard } from '@/modules/met';
import { Skeleton } from '@/components/ui/Spinner';

export default function MetTasksPage() {
  const { data, isLoading } = useMetDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Facility Management' }, { label: 'Task Queue' }]} />
      <MetTaskQueue tasks={data?.data?.tasks ?? []} devices={data?.data?.devices ?? []} />
    </div>
  );
}
