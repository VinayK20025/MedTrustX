'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrainingStaffMatrix, useTrainingDashboard } from '@/modules/training';
import { Skeleton } from '@/components/ui/Spinner';

export default function TrainingStatusPage() {
  const { data, isLoading } = useTrainingDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1200px]">
      <Breadcrumbs items={[{ label: 'Training' }, { label: 'Staff Training Status' }]} />
      <div className="h-[700px]"><TrainingStaffMatrix records={data?.data?.staffRecords ?? []} /></div>
    </div>
  );
}
