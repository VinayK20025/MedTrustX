'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SchedulerCalendarView, useAdmissionSchedulerDashboard } from '@/modules/admission-scheduler';
import { Skeleton } from '@/components/ui/Spinner';

export default function SchedulerCalendarPage() {
  const { data, isLoading } = useAdmissionSchedulerDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Front Office' }, { label: 'Doctor Calendar' }]} />
      <div className="h-[700px]"><SchedulerCalendarView schedules={data?.data?.doctorSchedules ?? []} /></div>
    </div>
  );
}
