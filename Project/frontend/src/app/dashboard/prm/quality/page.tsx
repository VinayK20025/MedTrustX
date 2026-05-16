'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PrmServiceQualityPanel, usePrmDashboard } from '@/modules/prm';
import { Skeleton } from '@/components/ui/Spinner';

export default function PrmQualityPage() {
  const { data, isLoading } = usePrmDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Patient Experience' }, { label: 'Service Quality Metrics' }]} />
      <PrmServiceQualityPanel metrics={data?.data?.qualityMetrics ?? []} />
    </div>
  );
}
