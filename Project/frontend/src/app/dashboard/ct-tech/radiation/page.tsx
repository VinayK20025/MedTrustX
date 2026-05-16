'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CtTechDosePanel, useCtTechDashboard } from '@/modules/ct-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function CtTechRadiationPage() {
  const { data, isLoading } = useCtTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Radiation Monitoring' }]} />
      <CtTechDosePanel records={data?.data?.doseRecords ?? []} />
    </div>
  );
}
