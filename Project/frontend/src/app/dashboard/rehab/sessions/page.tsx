'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RehabSessionPanel, useRehabDashboard } from '@/modules/rehab';
import { Skeleton } from '@/components/ui/Spinner';

export default function RehabSessionsPage() {
  const { data, isLoading } = useRehabDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Rehabilitation' }, { label: 'Daily Sessions' }]} />
      <RehabSessionPanel sessions={data?.data?.sessionsToday ?? []} />
    </div>
  );
}
