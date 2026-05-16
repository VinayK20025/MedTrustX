'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CirculatorCasePanel, useCirculatorDashboard } from '@/modules/ot-circulator';
import { Skeleton } from '@/components/ui/Spinner';

export default function CirculatorCasesPage() {
  const { data, isLoading } = useCirculatorDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'OT Team' }, { label: 'Active Case' }]} />
      <CirculatorCasePanel activeCase={data?.data?.activeCase} />
    </div>
  );
}
