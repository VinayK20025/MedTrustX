'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PsychologyPatientPanel, usePsychologyDashboard } from '@/modules/psychology';
import { Skeleton } from '@/components/ui/Spinner';

export default function PsychologyPatientsPage() {
  const { data, isLoading } = usePsychologyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Mental Health' }, { label: 'Active Clients' }]} />
      <PsychologyPatientPanel patients={data?.data?.patients ?? []} />
    </div>
  );
}
