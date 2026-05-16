'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CirculatorSupplyPanel, useCirculatorDashboard } from '@/modules/ot-circulator';
import { Skeleton } from '@/components/ui/Spinner';

export default function CirculatorSuppliesPage() {
  const { data, isLoading } = useCirculatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Supplies' }]} />
      <CirculatorSupplyPanel supplies={data?.data?.supplies ?? []} />
    </div>
  );
}
