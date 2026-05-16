'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { RehabEducationPanel, useRehabDashboard } from '@/modules/rehab';
import { Skeleton } from '@/components/ui/Spinner';

export default function RehabEducationPage() {
  const { data, isLoading } = useRehabDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Rehabilitation' }, { label: 'Patient Education' }]} />
      <RehabEducationPanel materials={data?.data?.educationMaterials ?? []} />
    </div>
  );
}
