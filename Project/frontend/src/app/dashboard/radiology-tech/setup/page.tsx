'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RadiologyTechSetupPanel, useRadiologyTechDashboard } from '@/modules/radiology-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function RadiologyTechSetupPage() {
  const { data, isLoading } = useRadiologyTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Protocol Setup' }]} />
      <RadiologyTechSetupPanel activePatient={data?.data?.activePatient} protocols={data?.data?.protocols ?? []} />
    </div>
  );
}
