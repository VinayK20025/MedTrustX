'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrainingSchedulePanel, useTrainingDashboard } from '@/modules/training';
import { Skeleton } from '@/components/ui/Spinner';

export default function TrainingCalendarPage() {
  const { data, isLoading } = useTrainingDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1000px]">
      <Breadcrumbs items={[{ label: 'Training' }, { label: 'Session Calendar' }]} />
      <div className="h-[700px]"><TrainingSchedulePanel sessions={data?.data?.upcomingSessions ?? []} programs={data?.data?.programs ?? []} /></div>
    </div>
  );
}
