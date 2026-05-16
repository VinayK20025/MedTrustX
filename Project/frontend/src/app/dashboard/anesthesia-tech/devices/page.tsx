'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AnesthesiaDevicePanel, useAnesthesiaTechDashboard } from '@/modules/anesthesia-tech';
import { Skeleton } from '@/components/ui/Spinner';

export default function AnesthesiaDevicesPage() {
  const { data, isLoading } = useAnesthesiaTechDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Anesthesia Dept' }, { label: 'Machines & Gases' }]} />
      <AnesthesiaDevicePanel machines={data?.data?.machines ?? []} />
    </div>
  );
}
