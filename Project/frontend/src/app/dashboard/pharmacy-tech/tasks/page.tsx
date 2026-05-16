'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PharmacyTechTaskQueue, usePharmacyTechDashboard } from '@/modules/pharmacy-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function PharmacyTechTasksPage() {
  const { data, isLoading } = usePharmacyTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Pharmacy Tech' }, { label: 'Task Queue' }]} />
      <PharmacyTechTaskQueue tasks={data?.data?.tasks ?? []} />
    </div>
  );
}
