'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LabTechProcessingPanel, useLabTechDashboard } from '@/modules/lab-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function LabTechProcessingPage() {
  const { data, isLoading } = useLabTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'SOP Processing' }]} />
      <LabTechProcessingPanel activeSample={data?.data?.activeSample} steps={data?.data?.processingSteps ?? []} />
    </div>
  );
}
