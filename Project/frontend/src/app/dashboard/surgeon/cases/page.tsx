'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SurgeonCasePanel, useSurgeonDashboard } from '@/modules/surgeon';
import { Skeleton } from '@/components/ui/Spinner';

export default function SurgeonCasesPage() {
  const { data, isLoading } = useSurgeonDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Surgical Department' }, { label: 'Daily Cases' }]} />
      <SurgeonCasePanel cases={data?.data?.casesToday ?? []} />
    </div>
  );
}
