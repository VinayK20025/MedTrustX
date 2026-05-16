'use client';
import React from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PathologistCasePanel, usePathologistDashboard } from '@/modules/pathologist';
import { Skeleton } from '@/components/ui/Spinner';

export default function PathologistCasesPage() {
  const { data, isLoading } = usePathologistDashboard({});
  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  return (
    <div className="space-y-5 animate-fade-in max-w-[1600px]">
      <Breadcrumbs items={[{ label: 'Laboratory' }, { label: 'Case Queue' }]} />
      <PathologistCasePanel cases={data?.data?.cases ?? []} />
    </div>
  );
}
