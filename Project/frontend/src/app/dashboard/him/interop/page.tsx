'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HimInteroperabilityPanel, useHimDashboard } from '@/modules/him';
import { Skeleton } from '@/components/ui/Spinner';

export default function HimInteropPage() {
  const { data, isLoading } = useHimDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Data Governance' }, { label: 'System Interoperability' }]} />
      <HimInteroperabilityPanel interop={data?.data?.interopStatus ?? []} />
    </div>
  );
}
