'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { TrainingCertAlertPanel, useTrainingDashboard } from '@/modules/training';
import { Skeleton } from '@/components/ui/Spinner';

export default function TrainingCertificationsPage() {
  const { data, isLoading } = useTrainingDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[800px]">
      <Breadcrumbs items={[{ label: 'Training' }, { label: 'Certification Tracker' }]} />
      <div className="h-[700px]"><TrainingCertAlertPanel alerts={data?.data?.certAlerts ?? []} /></div>
    </div>
  );
}
