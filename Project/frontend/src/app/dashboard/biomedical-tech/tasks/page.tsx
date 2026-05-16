'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BiomedTechTaskPanel, useBiomedTechDashboard } from '@/modules/biomedical-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function BiomedTechTasksPage() {
  const { data, isLoading } = useBiomedTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Field Execution' }, { label: 'Task Queue' }]} />
      <BiomedTechTaskPanel tasks={data?.data?.tasks ?? []} devices={data?.data?.devices ?? []} />
    </div>
  );
}
