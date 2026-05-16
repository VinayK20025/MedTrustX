'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MriTechScreeningPanel, useMriTechDashboard } from '@/modules/mri-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function MriTechScreeningPage() {
  const { data, isLoading } = useMriTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Safety Screening' }]} />
      <MriTechScreeningPanel activePatient={data?.data?.activePatient} checklist={data?.data?.activeChecklist} />
    </div>
  );
}
