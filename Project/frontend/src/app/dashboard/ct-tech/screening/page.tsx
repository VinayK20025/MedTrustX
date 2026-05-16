'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CtTechScreeningPanel, useCtTechDashboard } from '@/modules/ct-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function CtTechScreeningPage() {
  const { data, isLoading } = useCtTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Contrast Screening' }]} />
      <CtTechScreeningPanel activePatient={data?.data?.activePatient} screening={data?.data?.activeScreening} />
    </div>
  );
}
