'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { FrontDeskQueuePanel, useFrontDeskDashboard } from '@/modules/front-desk';
import { Skeleton } from '@/components/ui/Spinner';

export default function FrontDeskQueuePage() {
  const { data, isLoading } = useFrontDeskDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[800px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Token Queue Management' }]} />
      <div className="h-[700px]">
        <FrontDeskQueuePanel queue={data?.data?.activeQueue ?? []} />
      </div>
    </div>
  );
}
