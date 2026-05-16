'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BiochemInstrumentPanel, useBiochemDashboard } from '@/modules/biochemistry';
import { Skeleton } from '@/components/ui/Spinner';

export default function BiochemInstrumentsPage() {
  const { data, isLoading } = useBiochemDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Instrument Monitors' }]} />
      <BiochemInstrumentPanel instruments={data?.data?.instruments ?? []} />
    </div>
  );
}
