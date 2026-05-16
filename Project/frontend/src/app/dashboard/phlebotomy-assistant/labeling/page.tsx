'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PhlebotomyLabelPanel, usePhlebotomyDashboard } from '@/modules/phlebotomy-assistant';
import { Skeleton } from '@/components/ui/Spinner';

export default function PhlebotomyLabelingPage() {
  const { data, isLoading } = usePhlebotomyDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Diagnostics' }, { label: 'Label Printing' }]} />
      <PhlebotomyLabelPanel activePatient={data?.data?.activePatient} tests={data?.data?.activeTests ?? []} />
    </div>
  );
}
